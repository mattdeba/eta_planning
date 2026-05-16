import { ApiProperty } from '@nestjs/swagger';

export class AppInfoDto {
  @ApiProperty({ example: 'my_eta_planning_backend' })
  name: string;

  @ApiProperty({ example: 'Lightweight ETA planning backend' })
  description: string;

  @ApiProperty({ example: '/api/health' })
  health: string;

  @ApiProperty({ example: '/api/docs' })
  docs: string;
}
