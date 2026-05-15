import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './employee.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  findAll(etaId: string): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { etaId },
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
}
