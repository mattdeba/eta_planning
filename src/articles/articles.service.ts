import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
  ) {}

  findAll(etaId: string): Promise<Article[]> {
    return this.articlesRepository.find({
      where: { etaId },
      order: { code: 'ASC' },
    });
  }

  async findOne(etaId: string, id: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id, etaId },
    });

    if (!article) {
      throw new NotFoundException('Article not found.');
    }

    return article;
  }

  create(etaId: string, dto: CreateArticleDto): Promise<Article> {
    return this.articlesRepository.save(
      this.articlesRepository.create({
        ...dto,
        etaId,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async update(
    etaId: string,
    id: string,
    dto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findOne(etaId, id);
    Object.assign(article, dto);
    return this.articlesRepository.save(article);
  }
}
