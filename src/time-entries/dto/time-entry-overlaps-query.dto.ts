import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class TimeEntryOverlapsQueryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  start: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  end: string;

  @ApiProperty({ format: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  excludeTimeEntryId?: string;
}
