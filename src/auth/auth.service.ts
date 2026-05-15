import { randomUUID } from 'node:crypto';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { EtaUsersService } from '../eta-users/eta-users.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { AccessTokenPayload } from './interfaces/access-token-payload.interface';
import { AuthUser } from './interfaces/auth-user.interface';
import { RefreshTokenPayload } from './interfaces/refresh-token-payload.interface';
import { AuthResponseDto } from './dto/auth-response.dto';
import { EtaUser } from '../eta-users/eta-user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly etaUsersService: EtaUsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
  ) {}

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const memberships = await this.etaUsersService.getActiveMembershipsForUser(
      user.id,
    );
    if (!memberships.length) {
      throw new ForbiddenException('No active ETA membership found.');
    }

    return this.issueTokens(user, memberships, ipAddress, userAgent);
  }

  async refresh(
    dto: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const payload = this.verifyRefreshToken(dto.refreshToken);

    const persistedToken = await this.refreshTokensRepository.findOne({
      where: {
        id: payload.tokenId,
        userId: payload.sub,
      },
    });

    if (!persistedToken) {
      throw new UnauthorizedException('Refresh token not found.');
    }

    if (persistedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token already revoked.');
    }

    if (persistedToken.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired.');
    }

    const tokenMatches = await bcrypt.compare(
      dto.refreshToken,
      persistedToken.tokenHash,
    );
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not available.');
    }

    const memberships = await this.etaUsersService.getActiveMembershipsForUser(
      user.id,
    );
    if (!memberships.length) {
      throw new ForbiddenException('No active ETA membership found.');
    }

    persistedToken.revokedAt = new Date();
    await this.refreshTokensRepository.save(persistedToken);

    return this.issueTokens(user, memberships, ipAddress, userAgent);
  }

  async logout(currentUser: AuthUser, dto: RefreshTokenDto): Promise<void> {
    const payload = this.verifyRefreshToken(dto.refreshToken);

    if (payload.sub !== currentUser.userId) {
      throw new ForbiddenException('Token does not belong to current user.');
    }

    await this.refreshTokensRepository.update(
      {
        id: payload.tokenId,
        userId: currentUser.userId,
      },
      {
        revokedAt: new Date(),
      },
    );
  }

  async me(currentUser: AuthUser) {
    const user = await this.usersService.findById(currentUser.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found.');
    }

    const memberships = await this.etaUsersService.getActiveMembershipsForUser(
      user.id,
    );

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      activeEtaId: currentUser.activeEtaId,
      memberships: memberships.map((membership) => ({
        etaId: membership.etaId,
        etaName: membership.eta?.name,
        role: membership.role,
      })),
    };
  }

  private async issueTokens(
    user: User,
    memberships: EtaUser[],
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const normalizedMemberships = memberships.map((membership) => ({
      etaId: membership.etaId,
      role: membership.role,
    }));

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      activeEtaId: normalizedMemberships[0].etaId,
      memberships: normalizedMemberships,
    };

    const accessTokenExpiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
      '15m',
    );
    const accessTokenExpiresInSeconds = Math.floor(
      this.parseDurationToMs(accessTokenExpiresIn) / 1000,
    );

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessTokenExpiresInSeconds,
    });

    const refreshTokenId = randomUUID();
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      tokenId: refreshTokenId,
      type: 'refresh',
    };

    const refreshTokenExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '30d',
    );
    const refreshTokenExpiresInMs = this.parseDurationToMs(
      refreshTokenExpiresIn,
    );
    const refreshTokenExpiresInSeconds = Math.floor(
      refreshTokenExpiresInMs / 1000,
    );

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshTokenExpiresInSeconds,
    });

    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10)),
    );

    await this.refreshTokensRepository.save({
      id: refreshTokenId,
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + refreshTokenExpiresInMs),
      revokedAt: null,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      accessTokenExpiresIn,
    };
  }

  private verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token type.');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  private parseDurationToMs(value: string): number {
    const normalized = value.trim();

    if (/^\d+$/.test(normalized)) {
      return Number(normalized) * 1000;
    }

    const match = normalized.match(/^(\d+)\s*(s|m|h|d)$/i);
    if (!match) {
      throw new Error(
        `Unsupported duration format "${value}". Use values like 15m, 12h or 30d.`,
      );
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const factorMap: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return amount * factorMap[unit];
  }
}
