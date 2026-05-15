import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './unit.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
  ) {}

  findAll(etaId: string): Promise<Unit[]> {
    return this.unitsRepository.find({
      where: { etaId },
      order: { code: 'ASC' },
    });
  }

  async findOne(etaId: string, id: string): Promise<Unit> {
    const unit = await this.unitsRepository.findOne({
      where: { id, etaId },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found.');
    }

    return unit;
  }

  create(etaId: string, dto: CreateUnitDto): Promise<Unit> {
    return this.unitsRepository.save(
      this.unitsRepository.create({
        ...dto,
        etaId,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async update(etaId: string, id: string, dto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findOne(etaId, id);
    Object.assign(unit, dto);
    return this.unitsRepository.save(unit);
  }
}
