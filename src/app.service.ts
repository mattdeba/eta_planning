import { Injectable } from '@nestjs/common';
import { AppInfoDto } from './app-info.dto';

@Injectable()
export class AppService {
  getInfo(): AppInfoDto {
    return {
      name: 'my_eta_planning_backend',
      description: 'Lightweight ETA planning backend',
      health: '/api/health',
      docs: '/api/docs',
    };
  }
}
