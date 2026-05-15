import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ maxLength: 32 })
  @IsString()
  @MaxLength(32)
  code: string;

  @ApiProperty({ maxLength: 128 })
  @IsString()
  @MaxLength(128)
  label: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
