import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { ArticleType } from '../enums/article-type.enum';

export class ListArticlesQueryDto {
  @ApiPropertyOptional({ enum: ArticleType, isArray: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsOptional()
  @IsArray()
  @IsEnum(ArticleType, { each: true })
  types?: ArticleType[];
}
