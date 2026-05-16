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
import { Article } from './article.entity';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('articles')
@ApiEtaContext()
@UseGuards(JwtAuthGuard, EtaContextGuard, EtaRolesGuard)
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'List articles for current ETA.' })
  @ApiOkResponse({ type: [Article] })
  @ApiRouteErrors({ auth: true })
  findAll(@CurrentEta() currentEta: EtaContext): Promise<Article[]> {
    return this.articlesService.findAll(currentEta.etaId);
  }

  @Post()
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN, EtaRole.MATERIAL_MANAGER)
  @ApiOperation({ summary: 'Create article.' })
  @ApiBody({ type: CreateArticleDto })
  @ApiCreatedResponse({ type: Article })
  @ApiRouteErrors({ auth: true })
  create(
    @CurrentEta() currentEta: EtaContext,
    @Body() dto: CreateArticleDto,
  ): Promise<Article> {
    return this.articlesService.create(currentEta.etaId, dto);
  }

  @Patch(':id')
  @EtaRoles(EtaRole.OWNER, EtaRole.ADMIN, EtaRole.MATERIAL_MANAGER)
  @ApiOperation({ summary: 'Update article.' })
  @ApiUuidParam()
  @ApiBody({ type: UpdateArticleDto })
  @ApiOkResponse({ type: Article })
  @ApiRouteErrors({ auth: true, notFound: 'Article not found.' })
  update(
    @CurrentEta() currentEta: EtaContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<Article> {
    return this.articlesService.update(currentEta.etaId, id, dto);
  }
}
