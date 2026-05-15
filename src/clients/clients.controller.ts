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
import { Client } from './client.entity';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, EtaContextGuard, EtaRolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'List clients for current ETA.' })
  @ApiOkResponse({ type: [Client] })
  findAll(@CurrentEta() currentEta: EtaContext): Promise<Client[]> {
    return this.clientsService.findAll(currentEta.etaId);
  }

  @Post()
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN)
  @ApiOperation({ summary: 'Create client.' })
  @ApiCreatedResponse({ type: Client })
  create(
    @CurrentEta() currentEta: EtaContext,
    @Body() dto: CreateClientDto,
  ): Promise<Client> {
    return this.clientsService.create(currentEta.etaId, dto);
  }

  @Patch(':id')
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN)
  @ApiOperation({ summary: 'Update client.' })
  @ApiOkResponse({ type: Client })
  update(
    @CurrentEta() currentEta: EtaContext,
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ): Promise<Client> {
    return this.clientsService.update(currentEta.etaId, id, dto);
  }
}
