import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentEta } from '../common/decorators/current-eta.decorator';
import { EtaRoles } from '../common/decorators/eta-roles.decorator';
import { EtaRole } from '../common/enums/eta-role.enum';
import { EtaContextGuard } from '../common/guards/eta-context.guard';
import { EtaRolesGuard } from '../common/guards/eta-roles.guard';
import type { EtaContext } from '../common/interfaces/eta-context.interface';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './unit.entity';
import { UnitsService } from './units.service';

@ApiTags('units')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EtaContextGuard, EtaRolesGuard)
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'List units for current ETA.' })
  @ApiOkResponse({ type: [Unit] })
  findAll(@CurrentEta() currentEta: EtaContext): Promise<Unit[]> {
    return this.unitsService.findAll(currentEta.etaId);
  }

  @Post()
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN, EtaRole.MATERIAL_MANAGER)
  @ApiOperation({ summary: 'Create unit.' })
  @ApiCreatedResponse({ type: Unit })
  create(
    @CurrentEta() currentEta: EtaContext,
    @Body() dto: CreateUnitDto,
  ): Promise<Unit> {
    return this.unitsService.create(currentEta.etaId, dto);
  }

  @Patch(':id')
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN, EtaRole.MATERIAL_MANAGER)
  @ApiOperation({ summary: 'Update unit.' })
  @ApiOkResponse({ type: Unit })
  update(
    @CurrentEta() currentEta: EtaContext,
    @Param('id') id: string,
    @Body() dto: UpdateUnitDto,
  ): Promise<Unit> {
    return this.unitsService.update(currentEta.etaId, id, dto);
  }
}
