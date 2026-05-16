import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check service health.' })
  @ApiOkResponse({
    type: HealthResponseDto,
    description: 'Service health status.',
  })
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      service: 'my_eta_planning_backend',
      timestamp: new Date().toISOString(),
    };
  }
}
