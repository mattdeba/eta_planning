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
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material } from './material.entity';
import { MaterialsService } from './materials.service';

@ApiTags('materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EtaContextGuard, EtaRolesGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  @ApiOperation({ summary: 'List materials for current ETA.' })
  @ApiOkResponse({ type: [Material] })
  findAll(@CurrentEta() currentEta: EtaContext): Promise<Material[]> {
    return this.materialsService.findAll(currentEta.etaId);
  }

  @Post()
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN, EtaRole.MATERIAL_MANAGER)
  @ApiOperation({ summary: 'Create material.' })
  @ApiCreatedResponse({ type: Material })
  create(
    @CurrentEta() currentEta: EtaContext,
    @Body() dto: CreateMaterialDto,
  ): Promise<Material> {
    return this.materialsService.create(currentEta.etaId, dto);
  }

  @Patch(':id')
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN, EtaRole.MATERIAL_MANAGER)
  @ApiOperation({ summary: 'Update material.' })
  @ApiOkResponse({ type: Material })
  update(
    @CurrentEta() currentEta: EtaContext,
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
  ): Promise<Material> {
    return this.materialsService.update(currentEta.etaId, id, dto);
  }
}
