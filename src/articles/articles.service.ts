import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Unit } from '../units/unit.entity';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
  ) {}

  findAll(etaId: string): Promise<Article[]> {
    return this.articlesRepository.find({
      where: { etaId },
      relations: { units: true },
      order: { code: 'ASC' },
    });
  }

  async findOne(etaId: string, id: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id, etaId },
      relations: { units: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found.');
    }

    return article;
  }

  async create(etaId: string, dto: CreateArticleDto): Promise<Article> {
    const { unitIds, ...data } = dto;
    const units = await this.resolveUnits(etaId, unitIds);
    const article = await this.articlesRepository.save(
      this.articlesRepository.create({
        ...data,
        etaId,
        isActive: dto.isActive ?? true,
        units,
      }),
    );

    return this.findOne(etaId, article.id);
  }

  async update(
    etaId: string,
    id: string,
    dto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findOne(etaId, id);
    const { unitIds, ...data } = dto;
    Object.assign(article, data);

    if (unitIds !== undefined) {
      article.units = await this.resolveUnits(etaId, unitIds);
    }

    return this.articlesRepository.save(article);
  }

  private async resolveUnits(
    etaId: string,
    unitIds?: string[],
  ): Promise<Unit[]> {
    if (!unitIds?.length) {
      return [];
    }

    const uniqueIds = [...new Set(unitIds)];
    const units = await this.unitsRepository.find({
      where: { etaId, id: In(uniqueIds) },
    });

    if (units.length !== uniqueIds.length) {
      throw new NotFoundException('Some units were not found.');
    }

    return units;
  }
}
