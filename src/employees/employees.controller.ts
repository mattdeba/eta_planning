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
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './employee.entity';
import { EmployeesService } from './employees.service';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EtaContextGuard, EtaRolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees for current ETA.' })
  @ApiOkResponse({ type: [Employee] })
  findAll(@CurrentEta() currentEta: EtaContext): Promise<Employee[]> {
    return this.employeesService.findAll(currentEta.etaId);
  }

  @Post()
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN)
  @ApiOperation({ summary: 'Create employee.' })
  @ApiCreatedResponse({ type: Employee })
  create(
    @CurrentEta() currentEta: EtaContext,
    @Body() dto: CreateEmployeeDto,
  ): Promise<Employee> {
    return this.employeesService.create(currentEta.etaId, dto);
  }

  @Patch(':id')
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN)
  @ApiOperation({ summary: 'Update employee.' })
  @ApiOkResponse({ type: Employee })
  update(
    @CurrentEta() currentEta: EtaContext,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.employeesService.update(currentEta.etaId, id, dto);
  }
}
