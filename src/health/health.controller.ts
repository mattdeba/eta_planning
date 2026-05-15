import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ description: 'Service health status.' })
  getHealth() {
    return {
      status: 'ok',
      service: 'my_eta_planning_backend',
      timestamp: new Date().toISOString(),
    };
  }
}
