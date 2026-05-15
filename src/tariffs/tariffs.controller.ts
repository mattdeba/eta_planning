import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentEta } from '../common/decorators/current-eta.decorator';
import { EtaRoles } from '../common/decorators/eta-roles.decorator';
import { EtaRole } from '../common/enums/eta-role.enum';
import { EtaContextGuard } from '../common/guards/eta-context.guard';
import { EtaRolesGuard } from '../common/guards/eta-roles.guard';
import type { EtaContext } from '../common/interfaces/eta-context.interface';
import { CreateTariffCategoryDto } from './dto/create-tariff-category.dto';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { UpdateTariffCategoryDto } from './dto/update-tariff-category.dto';
import { UpdateTariffDto } from './dto/update-tariff.dto';
import { TariffCategory } from './tariff-category.entity';
import { Tariff } from './tariff.entity';
import { TariffsService } from './tariffs.service';

@ApiTags('tariffs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EtaContextGuard, EtaRolesGuard)
@Controller('tariffs')
export class TariffsController {
  constructor(private readonly tariffsService: TariffsService) {}

  @Get()
  @ApiOperation({ summary: 'List tariffs for current ETA.' })
  @ApiQuery({ name: 'articleId', required: false })
  @ApiOkResponse({ type: [Tariff] })
  findAll(
    @CurrentEta() currentEta: EtaContext,
    @Query('articleId') articleId?: string,
  ): Promise<Tariff[]> {
    return this.tariffsService.findAll(currentEta.etaId, articleId);
  }

  @Post()
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN, EtaRole.MATERIAL_MANAGER)
  @ApiOperation({ summary: 'Create tariff.' })
  @ApiCreatedResponse({ type: Tariff })
  create(
    @CurrentEta() currentEta: EtaContext,
    @Body() dto: CreateTariffDto,
  ): Promise<Tariff> {
    return this.tariffsService.create(currentEta.etaId, dto);
  }

  @Patch(':id')
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN, EtaRole.MATERIAL_MANAGER)
  @ApiOperation({ summary: 'Update tariff.' })
  @ApiOkResponse({ type: Tariff })
  update(
    @CurrentEta() currentEta: EtaContext,
    @Param('id') id: string,
    @Body() dto: UpdateTariffDto,
  ): Promise<Tariff> {
    return this.tariffsService.update(currentEta.etaId, id, dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List tariff categories for current ETA.' })
  @ApiOkResponse({ type: [TariffCategory] })
  findCategories(
    @CurrentEta() currentEta: EtaContext,
  ): Promise<TariffCategory[]> {
    return this.tariffsService.findCategories(currentEta.etaId);
  }

  @Post('categories')
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN, EtaRole.MATERIAL_MANAGER)
  @ApiOperation({ summary: 'Create tariff category.' })
  @ApiCreatedResponse({ type: TariffCategory })
  createCategory(
    @CurrentEta() currentEta: EtaContext,
    @Body() dto: CreateTariffCategoryDto,
  ): Promise<TariffCategory> {
    return this.tariffsService.createCategory(currentEta.etaId, dto);
  }

  @Patch('categories/:id')
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN, EtaRole.MATERIAL_MANAGER)
  @ApiOperation({ summary: 'Update tariff category.' })
  @ApiOkResponse({ type: TariffCategory })
  updateCategory(
    @CurrentEta() currentEta: EtaContext,
    @Param('id') id: string,
    @Body() dto: UpdateTariffCategoryDto,
  ): Promise<TariffCategory> {
    return this.tariffsService.updateCategory(currentEta.etaId, id, dto);
  }
}
