import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentEta } from '../common/decorators/current-eta.decorator';
import { EtaContextGuard } from '../common/guards/eta-context.guard';
import type { EtaContext } from '../common/interfaces/eta-context.interface';
import { Eta } from './eta.entity';
import { EtasService } from './etas.service';

@ApiTags('etas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EtaContextGuard)
@Controller('etas')
export class EtasController {
  constructor(private readonly etasService: EtasService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current ETA from token/header context.' })
  @ApiOkResponse({ type: Eta })
  getCurrent(@CurrentEta() currentEta: EtaContext): Promise<Eta> {
    return this.etasService.findCurrent(currentEta.etaId);
  }
}
