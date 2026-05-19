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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
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
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './employee.entity';
import { EmployeesService } from './employees.service';

@ApiTags('employees')
@ApiEtaContext()
@UseGuards(JwtAuthGuard, EtaContextGuard, EtaRolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees for current ETA.' })
  @ApiOkResponse({ type: [Employee] })
  @ApiRouteErrors({ auth: true })
  findAll(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
  ): Promise<Employee[]> {
    return this.employeesService.findAll(currentEta, currentUser);
  }

  @Post()
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN)
  @ApiOperation({ summary: 'Create employee.' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiCreatedResponse({ type: Employee })
  @ApiRouteErrors({ auth: true })
  create(
    @CurrentEta() currentEta: EtaContext,
    @Body() dto: CreateEmployeeDto,
  ): Promise<Employee> {
    return this.employeesService.create(currentEta.etaId, dto);
  }

  @Patch(':id')
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN)
  @ApiOperation({ summary: 'Update employee.' })
  @ApiUuidParam()
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiOkResponse({ type: Employee })
  @ApiRouteErrors({ auth: true, notFound: 'Employee not found.' })
  update(
    @CurrentEta() currentEta: EtaContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.employeesService.update(currentEta.etaId, id, dto);
  }
}
