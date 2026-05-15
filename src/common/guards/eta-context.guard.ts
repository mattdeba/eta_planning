import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { RequestWithEtaContext } from '../interfaces/request-with-eta-context.interface';

@Injectable()
export class EtaContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithEtaContext>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authenticated user is required.');
    }

    const requestedEtaId = this.readHeader(request.headers['x-current-eta-id']);
    const etaId = requestedEtaId ?? user.activeEtaId;
    const membership = user.memberships.find((item) => item.etaId === etaId);

    if (!membership) {
      throw new ForbiddenException('User is not a member of this ETA.');
    }

    request.currentEta = {
      etaId,
      role: membership.role,
    };

    return true;
  }

  private readHeader(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }
}
