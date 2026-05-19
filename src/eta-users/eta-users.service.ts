import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource, In, Not, Repository } from 'typeorm';
import { EtaRole } from '../common/enums/eta-role.enum';
import { Employee } from '../employees/employee.entity';
import { User } from '../users/user.entity';
import { CreateEtaUserDto } from './dto/create-eta-user.dto';
import { EtaUserAccountDto } from './dto/eta-user-response.dto';
import { UpdateEtaUserDto } from './dto/update-eta-user.dto';
import { EtaUser } from './eta-user.entity';

@Injectable()
export class EtaUsersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @InjectRepository(EtaUser)
    private readonly etaUsersRepository: Repository<EtaUser>,
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  getActiveMembershipsForUser(userId: string): Promise<EtaUser[]> {
    return this.etaUsersRepository.find({
      where: {
        userId,
        isActive: true,
        eta: {
          isActive: true,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  findActiveMembershipForEta(
    etaId: string,
    userId: string,
  ): Promise<EtaUser | null> {
    return this.etaUsersRepository.findOne({
      where: {
        etaId,
        userId,
        isActive: true,
        eta: {
          isActive: true,
        },
      },
    });
  }

  async findAllForEta(etaId: string): Promise<EtaUserAccountDto[]> {
    const memberships = await this.etaUsersRepository.find({
      where: { etaId },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });
    const employeesByUserId = await this.findEmployeesByUserId(
      etaId,
      memberships.map((membership) => membership.userId),
    );

    return memberships.map((membership) =>
      this.toResponse(membership, employeesByUserId.get(membership.userId)),
    );
  }

  async createEmployeeAccount(
    etaId: string,
    dto: CreateEtaUserDto,
  ): Promise<EtaUserAccountDto> {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(
      dto.password,
      Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10)),
    );

    const membershipId = await this.dataSource.transaction(async (manager) => {
      const usersRepository = manager.getRepository(User);
      const etaUsersRepository = manager.getRepository(EtaUser);
      const employeesRepository = manager.getRepository(Employee);

      const existingUser = await usersRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException(
          'An account already exists for this email.',
        );
      }

      const employee = dto.employeeId
        ? await this.findEmployeeForLink(employeesRepository, etaId, dto.employeeId)
        : null;

      const user = await usersRepository.save(
        usersRepository.create({
          email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          isActive: true,
        }),
      );

      const membership = await etaUsersRepository.save(
        etaUsersRepository.create({
          etaId,
          userId: user.id,
          role: EtaRole.EMPLOYEE,
          isActive: true,
        }),
      );

      if (employee) {
        employee.userId = user.id;
        employee.email = employee.email ?? email;
        await employeesRepository.save(employee);
      } else {
        await employeesRepository.save(
          employeesRepository.create({
            etaId,
            userId: user.id,
            code: null,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email,
            phone: null,
            dailyMinutes: 420,
            isActive: true,
          }),
        );
      }

      return membership.id;
    });

    return this.findOneForEta(etaId, membershipId);
  }

  async updateAccount(
    etaId: string,
    id: string,
    dto: UpdateEtaUserDto,
  ): Promise<EtaUserAccountDto> {
    await this.dataSource.transaction(async (manager) => {
      const usersRepository = manager.getRepository(User);
      const etaUsersRepository = manager.getRepository(EtaUser);
      const employeesRepository = manager.getRepository(Employee);
      const membership = await etaUsersRepository.findOne({
        where: { id, etaId },
        relations: { user: true },
      });

      if (!membership) {
        throw new NotFoundException('ETA user not found.');
      }

      const role = dto.role ?? membership.role;
      const isActive = dto.isActive ?? membership.isActive;
      await this.assertKeepsActiveAdmin(etaUsersRepository, membership, {
        role,
        isActive,
      });

      if (dto.firstName !== undefined) {
        membership.user.firstName = dto.firstName || null;
      }

      if (dto.lastName !== undefined) {
        membership.user.lastName = dto.lastName || null;
      }

      membership.role = role;
      membership.isActive = isActive;

      await this.updateEmployeeLink(employeesRepository, membership, {
        employeeId: dto.employeeId,
        role,
        isActive,
      });

      await usersRepository.save(membership.user);
      await etaUsersRepository.save(membership);
    });

    return this.findOneForEta(etaId, id);
  }

  private async findOneForEta(
    etaId: string,
    id: string,
  ): Promise<EtaUserAccountDto> {
    const membership = await this.etaUsersRepository.findOne({
      where: { id, etaId },
      relations: { user: true },
    });

    if (!membership) {
      throw new NotFoundException('ETA user not found.');
    }

    const employee = await this.employeesRepository.findOne({
      where: { etaId, userId: membership.userId },
    });

    return this.toResponse(membership, employee);
  }

  private async findEmployeesByUserId(
    etaId: string,
    userIds: string[],
  ): Promise<Map<string, Employee>> {
    const uniqueUserIds = [...new Set(userIds)];
    if (!uniqueUserIds.length) {
      return new Map();
    }

    const employees = await this.employeesRepository.find({
      where: { etaId, userId: In(uniqueUserIds) },
    });

    return new Map(
      employees
        .filter((employee): employee is Employee & { userId: string } =>
          Boolean(employee.userId),
        )
        .map((employee) => [employee.userId, employee]),
    );
  }

  private async findEmployeeForLink(
    employeesRepository: Repository<Employee>,
    etaId: string,
    employeeId: string,
  ): Promise<Employee> {
    const employee = await employeesRepository.findOne({
      where: { id: employeeId, etaId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    if (employee.userId) {
      throw new ConflictException('Employee is already linked to a user.');
    }

    return employee;
  }

  private async assertKeepsActiveAdmin(
    etaUsersRepository: Repository<EtaUser>,
    membership: EtaUser,
    next: Pick<EtaUser, 'role' | 'isActive'>,
  ): Promise<void> {
    if (next.isActive && this.isAdminRole(next.role)) {
      return;
    }

    if (!membership.isActive || !this.isAdminRole(membership.role)) {
      return;
    }

    const remainingAdmins = await etaUsersRepository.count({
      where: {
        id: Not(membership.id),
        etaId: membership.etaId,
        isActive: true,
        role: In([EtaRole.OWNER, EtaRole.ADMIN]),
      },
    });

    if (!remainingAdmins) {
      throw new ForbiddenException(
        'At least one active admin must remain for this ETA.',
      );
    }
  }

  private async updateEmployeeLink(
    employeesRepository: Repository<Employee>,
    membership: EtaUser,
    next: {
      employeeId: string | null | undefined;
      role: EtaRole;
      isActive: boolean;
    },
  ): Promise<void> {
    if (next.employeeId === undefined) {
      await this.assertEmployeeRoleHasLink(employeesRepository, membership, next);
      return;
    }

    const currentEmployee = await employeesRepository.findOne({
      where: { etaId: membership.etaId, userId: membership.userId },
    });

    if (next.employeeId === null) {
      if (currentEmployee) {
        currentEmployee.userId = null;
        await employeesRepository.save(currentEmployee);
      }
      await this.assertEmployeeRoleHasLink(employeesRepository, membership, next);
      return;
    }

    const nextEmployee = await employeesRepository.findOne({
      where: { id: next.employeeId, etaId: membership.etaId },
    });

    if (!nextEmployee) {
      throw new NotFoundException('Employee not found.');
    }

    if (nextEmployee.userId && nextEmployee.userId !== membership.userId) {
      throw new ConflictException('Employee is already linked to a user.');
    }

    if (currentEmployee && currentEmployee.id !== nextEmployee.id) {
      currentEmployee.userId = null;
      await employeesRepository.save(currentEmployee);
    }

    nextEmployee.userId = membership.userId;
    nextEmployee.email = nextEmployee.email ?? membership.user.email;
    await employeesRepository.save(nextEmployee);
  }

  private async assertEmployeeRoleHasLink(
    employeesRepository: Repository<Employee>,
    membership: EtaUser,
    next: Pick<EtaUser, 'role' | 'isActive'>,
  ): Promise<void> {
    if (!next.isActive || next.role !== EtaRole.EMPLOYEE) {
      return;
    }

    const employee = await employeesRepository.findOne({
      where: { etaId: membership.etaId, userId: membership.userId },
    });

    if (!employee) {
      throw new BadRequestException(
        'An active employee user must be linked to an employee.',
      );
    }
  }

  private isAdminRole(role: EtaRole): boolean {
    return role === EtaRole.OWNER || role === EtaRole.ADMIN;
  }

  private toResponse(
    membership: EtaUser,
    employee: Employee | null | undefined,
  ): EtaUserAccountDto {
    return {
      id: membership.id,
      etaId: membership.etaId,
      userId: membership.userId,
      email: membership.user.email,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      role: membership.role,
      isActive: membership.isActive,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
      employee: employee ?? null,
    };
  }
}
