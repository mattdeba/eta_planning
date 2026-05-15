import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Eta } from './eta.entity';

@Injectable()
export class EtasService {
  constructor(
    @InjectRepository(Eta)
    private readonly etasRepository: Repository<Eta>,
  ) {}

  async findCurrent(etaId: string): Promise<Eta> {
    const eta = await this.etasRepository.findOne({
      where: {
        id: etaId,
        isActive: true,
      },
    });

    if (!eta) {
      throw new NotFoundException('ETA not found.');
    }

    return eta;
  }
}
