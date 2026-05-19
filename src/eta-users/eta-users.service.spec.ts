import {
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { EtaRole } from '../common/enums/eta-role.enum';
import { Employee } from '../employees/employee.entity';
import { User } from '../users/user.entity';
import { EtaUser } from './eta-user.entity';
import { EtaUsersService } from './eta-users.service';

const ETA_ID = '11111111-1111-4111-8111-111111111111';
const USER_ID = '22222222-2222-4222-8222-222222222222';
const EMPLOYEE_ID = '33333333-3333-4333-8333-333333333333';
const MEMBERSHIP_ID = '44444444-4444-4444-8444-444444444444';

describe('EtaUsersService', () => {
  const usersRepository = {
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(),
  };
  const transactionEtaUsersRepository = {
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(),
  };
  const transactionEmployeesRepository = {
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(),
  };
  const manager = {
    getRepository: jest.fn((entity) => {
      if (entity === User) return usersRepository;
      if (entity === EtaUser) return transactionEtaUsersRepository;
      if (entity === Employee) return transactionEmployeesRepository;
      throw new Error('Unexpected repository');
    }),
  };
  const dataSource = {
    transaction: jest.fn((callback) => callback(manager)),
  };
  const configService = {
    get: jest.fn(() => 1),
  };
  const etaUsersRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const employeesRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const service = new EtaUsersService(
    dataSource as any,
    configService as any,
    etaUsersRepository as any,
    employeesRepository as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an employee user account and an employee link', async () => {
    const savedUser = {
      id: USER_ID,
      email: 'employee@eta.local',
      firstName: 'Jean',
      lastName: 'Dupont',
    };
    const membership = {
      id: MEMBERSHIP_ID,
      etaId: ETA_ID,
      userId: USER_ID,
      role: EtaRole.EMPLOYEE,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: savedUser,
    };
    const employee = {
      id: EMPLOYEE_ID,
      etaId: ETA_ID,
      userId: USER_ID,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'employee@eta.local',
    };

    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.save.mockResolvedValue(savedUser);
    transactionEtaUsersRepository.save.mockResolvedValue(membership);
    transactionEmployeesRepository.save.mockResolvedValue(employee);
    etaUsersRepository.findOne.mockResolvedValue(membership);
    employeesRepository.findOne.mockResolvedValue(employee);

    const result = await service.createEmployeeAccount(ETA_ID, {
      email: 'employee@eta.local',
      password: 'ChangeMe123!',
      firstName: 'Jean',
      lastName: 'Dupont',
    });

    expect(result).toMatchObject({
      email: 'employee@eta.local',
      role: EtaRole.EMPLOYEE,
      employee,
    });
    expect(transactionEtaUsersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: EtaRole.EMPLOYEE }),
    );
    expect(transactionEmployeesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        etaId: ETA_ID,
        userId: USER_ID,
        firstName: 'Jean',
        lastName: 'Dupont',
      }),
    );
  });

  it('rejects duplicate account emails', async () => {
    usersRepository.findOne.mockResolvedValue({ id: USER_ID });

    await expect(
      service.createEmployeeAccount(ETA_ID, {
        email: 'employee@eta.local',
        password: 'ChangeMe123!',
        firstName: 'Jean',
        lastName: 'Dupont',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('prevents demoting the last active admin', async () => {
    transactionEtaUsersRepository.findOne.mockResolvedValue({
      id: MEMBERSHIP_ID,
      etaId: ETA_ID,
      userId: USER_ID,
      role: EtaRole.ADMIN,
      isActive: true,
      user: { id: USER_ID, email: 'admin@eta.local' },
    });
    transactionEtaUsersRepository.count.mockResolvedValue(0);

    await expect(
      service.updateAccount(ETA_ID, MEMBERSHIP_ID, {
        role: EtaRole.EMPLOYEE,
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
