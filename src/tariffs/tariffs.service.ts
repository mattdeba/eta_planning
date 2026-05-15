import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTariffCategoryDto } from './dto/create-tariff-category.dto';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { UpdateTariffCategoryDto } from './dto/update-tariff-category.dto';
import { UpdateTariffDto } from './dto/update-tariff.dto';
import { TariffCategory } from './tariff-category.entity';
import { Tariff } from './tariff.entity';

@Injectable()
export class TariffsService {
  constructor(
    @InjectRepository(Tariff)
    private readonly tariffsRepository: Repository<Tariff>,
    @InjectRepository(TariffCategory)
    private readonly categoriesRepository: Repository<TariffCategory>,
  ) {}

  findAll(etaId: string, articleId?: string): Promise<Tariff[]> {
    return this.tariffsRepository.find({
      where: {
        etaId,
        ...(articleId ? { articleId } : {}),
      },
      order: { label: 'ASC' },
    });
  }

  async findOne(etaId: string, id: string): Promise<Tariff> {
    const tariff = await this.tariffsRepository.findOne({
      where: { id, etaId },
    });

    if (!tariff) {
      throw new NotFoundException('Tariff not found.');
    }

    return tariff;
  }

  create(etaId: string, dto: CreateTariffDto): Promise<Tariff> {
    return this.tariffsRepository.save(
      this.tariffsRepository.create({
        ...dto,
        etaId,
        categoryId: dto.categoryId ?? null,
        unitPrice: dto.unitPrice ?? null,
        validFrom: dto.validFrom ?? null,
        validTo: dto.validTo ?? null,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async update(
    etaId: string,
    id: string,
    dto: UpdateTariffDto,
  ): Promise<Tariff> {
    const tariff = await this.findOne(etaId, id);
    Object.assign(tariff, dto);
    return this.tariffsRepository.save(tariff);
  }

  findCategories(etaId: string): Promise<TariffCategory[]> {
    return this.categoriesRepository.find({
      where: { etaId },
      order: { name: 'ASC' },
    });
  }

  createCategory(
    etaId: string,
    dto: CreateTariffCategoryDto,
  ): Promise<TariffCategory> {
    return this.categoriesRepository.save(
      this.categoriesRepository.create({
        ...dto,
        etaId,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async updateCategory(
    etaId: string,
    id: string,
    dto: UpdateTariffCategoryDto,
  ): Promise<TariffCategory> {
    const category = await this.categoriesRepository.findOne({
      where: { id, etaId },
    });

    if (!category) {
      throw new NotFoundException('Tariff category not found.');
    }

    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }
}
