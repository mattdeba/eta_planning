import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ArticleType } from '../enums/article-type.enum';

export class CreateArticleDto {
  @ApiProperty({ maxLength: 64 })
  @IsString()
  @MaxLength(64)
  code: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ enum: ArticleType })
  @IsEnum(ArticleType)
  type: ArticleType;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  unitIds?: string[];
}
