import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { SearchTimeEntriesDto } from './dto/search-time-entries.dto';
import { TimeEntryOverlapsQueryDto } from './dto/time-entry-overlaps-query.dto';
import { TimeEntryStatsDto } from './dto/time-entry-stats.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { ValidateTimeEntriesDto } from './dto/validate-time-entries.dto';
import { TimeEntry } from './entities/time-entry.entity';
import { TimeEntriesService } from './time-entries.service';

@ApiTags('time-entries')
@ApiBearerAuth()
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
  @ApiCreatedResponse({ type: TimeEntry })
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
  @ApiOkResponse({ type: [TimeEntry] })
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
  @ApiOkResponse({ type: [TimeEntry] })
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
  @ApiOkResponse({ schema: { example: { validated: 2 } } })
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
  @ApiOkResponse()
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
  @ApiOkResponse()
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
  @ApiOkResponse({ type: TimeEntry })
  findOne(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
    @Param('id') id: string,
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
  @ApiOkResponse({ type: TimeEntry })
  update(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
    @Param('id') id: string,
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
  @ApiOkResponse({ type: TimeEntry })
  remove(
    @CurrentEta() currentEta: EtaContext,
    @CurrentUser() currentUser: AuthUser,
    @Param('id') id: string,
  ): Promise<TimeEntry> {
    return this.timeEntriesService.remove(currentEta, currentUser, id);
  }
}
