import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: 'my_eta_planning_backend' })
  service: string;

  @ApiProperty({
    example: '2026-05-16T10:30:00.000Z',
    format: 'date-time',
  })
  timestamp: string;
}
