import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppInfoDto } from './app-info.dto';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get API metadata.' })
  @ApiOkResponse({ type: AppInfoDto, description: 'Application metadata.' })
  getInfo(): AppInfoDto {
    return this.appService.getInfo();
  }
}
