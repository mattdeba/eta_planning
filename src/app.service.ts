import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'my_eta_planning_backend',
      description: 'Lightweight ETA planning backend',
      health: '/api/health',
      docs: '/api/docs',
    };
  }
}
