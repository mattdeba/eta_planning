import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { EtaRole } from '../common/enums/eta-role.enum';
import type { EtaContext } from '../common/interfaces/eta-context.interface';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './employee.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  findAll(currentEta: EtaContext, currentUser: AuthUser): Promise<Employee[]> {
    if (currentEta.role === EtaRole.EMPLOYEE) {
      return this.employeesRepository.find({
        where: {
          etaId: currentEta.etaId,
          userId: currentUser.userId,
          isActive: true,
        },
        order: { lastName: 'ASC', firstName: 'ASC' },
      });
    }

    if (!this.canListAll(currentEta.role)) {
      throw new ForbiddenException('Cannot list employees.');
    }

    return this.employeesRepository.find({
      where: { etaId: currentEta.etaId },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findOne(etaId: string, id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id, etaId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    return employee;
  }

  async findForUser(etaId: string, userId: string): Promise<Employee | null> {
    return this.employeesRepository.findOne({
      where: { etaId, userId, isActive: true },
    });
  }

  create(etaId: string, dto: CreateEmployeeDto): Promise<Employee> {
    return this.employeesRepository.save(
      this.employeesRepository.create({
        ...dto,
        etaId,
        userId: dto.userId ?? null,
        code: dto.code ?? null,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        dailyMinutes: dto.dailyMinutes ?? 420,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async update(
    etaId: string,
    id: string,
    dto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.findOne(etaId, id);
    Object.assign(employee, dto);
    return this.employeesRepository.save(employee);
  }

  private canListAll(role: EtaRole): boolean {
    return [EtaRole.OWNER, EtaRole.ADMIN, EtaRole.MATERIAL_MANAGER].includes(
      role,
    );
  }
}
