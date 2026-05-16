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
import { Client } from './client.entity';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('clients')
@ApiEtaContext()
@UseGuards(JwtAuthGuard, EtaContextGuard, EtaRolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'List clients for current ETA.' })
  @ApiOkResponse({ type: [Client] })
  @ApiRouteErrors({ auth: true })
  findAll(@CurrentEta() currentEta: EtaContext): Promise<Client[]> {
    return this.clientsService.findAll(currentEta.etaId);
  }

  @Post()
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN)
  @ApiOperation({ summary: 'Create client.' })
  @ApiBody({ type: CreateClientDto })
  @ApiCreatedResponse({ type: Client })
  @ApiRouteErrors({ auth: true })
  create(
    @CurrentEta() currentEta: EtaContext,
    @Body() dto: CreateClientDto,
  ): Promise<Client> {
    return this.clientsService.create(currentEta.etaId, dto);
  }

  @Patch(':id')
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN)
  @ApiOperation({ summary: 'Update client.' })
  @ApiUuidParam()
  @ApiBody({ type: UpdateClientDto })
  @ApiOkResponse({ type: Client })
  @ApiRouteErrors({ auth: true, notFound: 'Client not found.' })
  update(
    @CurrentEta() currentEta: EtaContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
  ): Promise<Client> {
    return this.clientsService.update(currentEta.etaId, id, dto);
  }
}
