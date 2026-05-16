import { ApiProperty } from '@nestjs/swagger';

export class TimeEntryWeekStatsResponseDto {
  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 20 })
  week: number;

  @ApiProperty({ example: '11/05/2026' })
  weekStart: string;

  @ApiProperty({ example: '17/05/2026' })
  weekEnd: string;

  @ApiProperty({ example: 2100 })
  totalMinutes: number;
}

export class TimeEntryMonthStatsResponseDto {
  @ApiProperty({ example: '05/2026' })
  month: string;

  @ApiProperty({ example: 125.5 })
  personalKm: number;

  @ApiProperty({ example: 42.25 })
  personalAmount: number;

  @ApiProperty({ example: 1680 })
  clientWork: number;

  @ApiProperty({ example: 0 })
  absence: number;

  @ApiProperty({ example: 120 })
  travel: number;

  @ApiProperty({ example: 90 })
  maintenance: number;

  @ApiProperty({ example: 210 })
  etaWork: number;
}
