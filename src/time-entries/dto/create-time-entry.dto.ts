import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateTimeEntryMaterialDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  materialId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  meterStart?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  meterEnd?: number;
}

export class CreateTimeEntryQuantityDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  unitId: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  tariffId?: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateTimeEntryConsumableDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  materialId?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  articleId: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  tariffId?: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  meterStart?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  meterEnd?: number;
}

export class CreateTimeEntryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  articleId: string;

  @ApiProperty({ format: 'date', example: '2026-05-16' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  personalKm?: number;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  personalAmount?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  halfDay?: boolean;

  @ApiPropertyOptional({ type: [CreateTimeEntryMaterialDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTimeEntryMaterialDto)
  materials?: CreateTimeEntryMaterialDto[];

  @ApiPropertyOptional({ type: [CreateTimeEntryQuantityDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTimeEntryQuantityDto)
  quantities?: CreateTimeEntryQuantityDto[];

  @ApiPropertyOptional({ type: [CreateTimeEntryConsumableDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTimeEntryConsumableDto)
  consumables?: CreateTimeEntryConsumableDto[];
}
