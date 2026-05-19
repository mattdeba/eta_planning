import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
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
import {
  ApiEtaContext,
  ApiRouteErrors,
  ApiUuidParam,
} from '../common/swagger/api-route-decorators';
import { CreateEtaUserDto } from './dto/create-eta-user.dto';
import { EtaUserAccountDto } from './dto/eta-user-response.dto';
import { UpdateEtaUserDto } from './dto/update-eta-user.dto';
import { EtaUsersService } from './eta-users.service';

@ApiTags('eta-users')
@ApiEtaContext()
@UseGuards(JwtAuthGuard, EtaContextGuard, EtaRolesGuard)
@EtaRoles(EtaRole.OWNER, EtaRole.ADMIN)
@Controller('eta-users')
export class EtaUsersController {
  constructor(private readonly etaUsersService: EtaUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List user accounts for current ETA.' })
  @ApiOkResponse({ type: [EtaUserAccountDto] })
  @ApiRouteErrors({ auth: true })
  findAll(@CurrentEta() currentEta: EtaContext): Promise<EtaUserAccountDto[]> {
    return this.etaUsersService.findAllForEta(currentEta.etaId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an employee user account for current ETA.' })
  @ApiBody({ type: CreateEtaUserDto })
  @ApiCreatedResponse({ type: EtaUserAccountDto })
  @ApiRouteErrors({
    auth: true,
    conflict: 'Email already exists or employee is already linked.',
    notFound: 'Employee not found.',
  })
  create(
    @CurrentEta() currentEta: EtaContext,
    @Body() dto: CreateEtaUserDto,
  ): Promise<EtaUserAccountDto> {
    return this.etaUsersService.createEmployeeAccount(currentEta.etaId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one ETA user account.' })
  @ApiUuidParam()
  @ApiBody({ type: UpdateEtaUserDto })
  @ApiOkResponse({ type: EtaUserAccountDto })
  @ApiRouteErrors({
    auth: true,
    conflict: 'Employee is already linked.',
    forbidden: 'At least one active admin must remain.',
    notFound: 'ETA user or employee not found.',
  })
  update(
    @CurrentEta() currentEta: EtaContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEtaUserDto,
  ): Promise<EtaUserAccountDto> {
    return this.etaUsersService.updateAccount(currentEta.etaId, id, dto);
  }
}
