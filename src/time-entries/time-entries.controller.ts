import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
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
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { SearchTimeEntriesDto } from './dto/search-time-entries.dto';
import { TimeEntryOverlapsQueryDto } from './dto/time-entry-overlaps-query.dto';
import {
  TimeEntryMonthStatsResponseDto,
  TimeEntryWeekStatsResponseDto,
} from './dto/time-entry-stats-response.dto';
import { TimeEntryStatsDto } from './dto/time-entry-stats.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { ValidateTimeEntriesResponseDto } from './dto/validate-time-entries-response.dto';
import { ValidateTimeEntriesDto } from './dto/validate-time-entries.dto';
import { TimeEntry } from './entities/time-entry.entity';
import { TimeEntriesService } from './time-entries.service';

@ApiTags('time-entries')
@ApiEtaContext()
@UseGuards(JwtAuthGuard, EtaContextGuard, EtaRolesGuard)
@Controller('time-entries')
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  @EtaRoles(
    EtaRole.OWNER,
    EtaRole.ADMIN,
    EtaRole.EMPLOYEE,
    EtaRole.MATERIAL_MANAGER,
  )
  @ApiOperation({ summary: 'Create a complete time entry in one transaction.' })
  @ApiBody({ type: CreateTimeEntryDto })
  @ApiCreatedResponse({ type: TimeEntry })
  @ApiRouteErrors({
    auth: true,
    conflict: 'Employee already has a time entry in this range.',
    notFound:
      'A referenced client, employee, material, article or tariff was not found.',
  })
  create(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
    @Body() dto: CreateTimeEntryDto,
  ): Promise<TimeEntry> {
    return this.timeEntriesService.create(currentEta, currentUser, dto);
  }

  @Post('search')
  @HttpCode(200)
  @EtaRoles(
    EtaRole.OWNER,
    EtaRole.ADMIN,
    EtaRole.EMPLOYEE,
    EtaRole.MATERIAL_MANAGER,
  )
  @ApiOperation({ summary: 'Search time entries.' })
  @ApiBody({ type: SearchTimeEntriesDto })
  @ApiOkResponse({ type: [TimeEntry] })
  @ApiRouteErrors({ auth: true })
  search(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
    @Body() dto: SearchTimeEntriesDto,
  ): Promise<TimeEntry[]> {
    return this.timeEntriesService.search(currentEta, currentUser, dto);
  }

  @Get('overlaps')
  @EtaRoles(
    EtaRole.OWNER,
    EtaRole.ADMIN,
    EtaRole.EMPLOYEE,
    EtaRole.MATERIAL_MANAGER,
  )
  @ApiOperation({ summary: 'List overlapping time entries for one employee.' })
  @ApiQuery({ name: 'employeeId', format: 'uuid' })
  @ApiQuery({ name: 'start', format: 'date-time' })
  @ApiQuery({ name: 'end', format: 'date-time' })
  @ApiQuery({ name: 'excludeTimeEntryId', required: false, format: 'uuid' })
  @ApiOkResponse({ type: [TimeEntry] })
  @ApiRouteErrors({ auth: true, notFound: 'Employee not found.' })
  getOverlaps(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
    @Query() query: TimeEntryOverlapsQueryDto,
  ): Promise<TimeEntry[]> {
    return this.timeEntriesService.getOverlaps(currentEta, currentUser, query);
  }

  @Post('validate')
  @HttpCode(200)
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN)
  @ApiOperation({ summary: 'Validate a list of time entries.' })
  @ApiBody({ type: ValidateTimeEntriesDto })
  @ApiOkResponse({ type: ValidateTimeEntriesResponseDto })
  @ApiRouteErrors({
    auth: true,
    notFound: 'Some time entries were not found.',
  })
  validate(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
    @Body() dto: ValidateTimeEntriesDto,
  ): Promise<{ validated: number }> {
    return this.timeEntriesService.validate(
      currentEta,
      currentUser,
      dto.timeEntryIds,
    );
  }

  @Post('stats/weeks')
  @HttpCode(200)
  @EtaRoles(
    EtaRole.OWNER,
    EtaRole.ADMIN,
    EtaRole.EMPLOYEE,
    EtaRole.MATERIAL_MANAGER,
  )
  @ApiOperation({ summary: 'Aggregate employee time by ISO week.' })
  @ApiBody({ type: TimeEntryStatsDto })
  @ApiOkResponse({ type: [TimeEntryWeekStatsResponseDto] })
  @ApiRouteErrors({ auth: true })
  statsByWeeks(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
    @Body() dto: TimeEntryStatsDto,
  ) {
    return this.timeEntriesService.statsByWeeks(currentEta, currentUser, dto);
  }

  @Post('stats/months')
  @HttpCode(200)
  @EtaRoles(
    EtaRole.OWNER,
    EtaRole.ADMIN,
    EtaRole.EMPLOYEE,
    EtaRole.MATERIAL_MANAGER,
  )
  @ApiOperation({ summary: 'Aggregate employee time and expenses by month.' })
  @ApiBody({ type: TimeEntryStatsDto })
  @ApiOkResponse({ type: [TimeEntryMonthStatsResponseDto] })
  @ApiRouteErrors({ auth: true })
  statsByMonths(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
    @Body() dto: TimeEntryStatsDto,
  ) {
    return this.timeEntriesService.statsByMonths(currentEta, currentUser, dto);
  }

  @Get(':id')
  @EtaRoles(
    EtaRole.OWNER,
    EtaRole.ADMIN,
    EtaRole.EMPLOYEE,
    EtaRole.MATERIAL_MANAGER,
  )
  @ApiOperation({ summary: 'Get one time entry.' })
  @ApiUuidParam()
  @ApiOkResponse({ type: TimeEntry })
  @ApiRouteErrors({ auth: true, notFound: 'Time entry not found.' })
  findOne(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TimeEntry> {
    return this.timeEntriesService.findOne(currentEta, currentUser, id);
  }

  @Patch(':id')
  @EtaRoles(
    EtaRole.OWNER,
    EtaRole.ADMIN,
    EtaRole.EMPLOYEE,
    EtaRole.MATERIAL_MANAGER,
  )
  @ApiOperation({ summary: 'Update one time entry.' })
  @ApiUuidParam()
  @ApiBody({ type: UpdateTimeEntryDto })
  @ApiOkResponse({ type: TimeEntry })
  @ApiRouteErrors({
    auth: true,
    conflict: 'Employee already has a time entry in this range.',
    notFound: 'Time entry or a referenced entity was not found.',
  })
  update(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTimeEntryDto,
  ): Promise<TimeEntry> {
    return this.timeEntriesService.update(currentEta, currentUser, id, dto);
  }

  @Delete(':id')
  @EtaRoles(
    EtaRole.OWNER,
    EtaRole.ADMIN,
    EtaRole.EMPLOYEE,
    EtaRole.MATERIAL_MANAGER,
  )
  @ApiOperation({ summary: 'Delete one time entry.' })
  @ApiUuidParam()
  @ApiOkResponse({ type: TimeEntry })
  @ApiRouteErrors({ auth: true, notFound: 'Time entry not found.' })
  remove(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TimeEntry> {
    return this.timeEntriesService.remove(currentEta, currentUser, id);
  }
}
