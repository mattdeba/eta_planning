import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material } from './material.entity';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialsRepository: Repository<Material>,
  ) {}

  findAll(etaId: string): Promise<Material[]> {
    return this.materialsRepository.find({
      where: { etaId },
      order: { name: 'ASC' },
    });
  }

  async findOne(etaId: string, id: string): Promise<Material> {
    const material = await this.materialsRepository.findOne({
      where: { id, etaId },
    });

    if (!material) {
      throw new NotFoundException('Material not found.');
    }

    return material;
  }

  create(etaId: string, dto: CreateMaterialDto): Promise<Material> {
    return this.materialsRepository.save(
      this.materialsRepository.create({
        ...dto,
        etaId,
        code: dto.code ?? null,
        registrationNumber: dto.registrationNumber ?? null,
        analyticCode: dto.analyticCode ?? null,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async update(
    etaId: string,
    id: string,
    dto: UpdateMaterialDto,
  ): Promise<Material> {
    const material = await this.findOne(etaId, id);
    Object.assign(material, dto);
    return this.materialsRepository.save(material);
  }
}
