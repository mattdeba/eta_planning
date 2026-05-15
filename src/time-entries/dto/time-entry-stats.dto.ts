import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class TimeEntryStatsDto {
  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  start: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  end: string;

  @ApiPropertyOptional({ type: [String], format: 'uuid' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  employeeIds?: string[];
}
