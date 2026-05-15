import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EtaUser } from './eta-user.entity';

@Injectable()
export class EtaUsersService {
  constructor(
    @InjectRepository(EtaUser)
    private readonly etaUsersRepository: Repository<EtaUser>,
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
}
