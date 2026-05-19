import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { ArticlesController } from '../src/articles/articles.controller';
import { ArticlesService } from '../src/articles/articles.service';
import { ArticleType } from '../src/articles/enums/article-type.enum';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import type { AuthUser } from '../src/auth/interfaces/auth-user.interface';
import { ClientsController } from '../src/clients/clients.controller';
import { ClientsService } from '../src/clients/clients.service';
import { EtaRole } from '../src/common/enums/eta-role.enum';
import { EtaContextGuard } from '../src/common/guards/eta-context.guard';
import { EtaRolesGuard } from '../src/common/guards/eta-roles.guard';
import type { EtaContext } from '../src/common/interfaces/eta-context.interface';
import { EmployeesController } from '../src/employees/employees.controller';
import { EmployeesService } from '../src/employees/employees.service';
import { EtasController } from '../src/etas/etas.controller';
import { EtasService } from '../src/etas/etas.service';
import { HealthController } from '../src/health/health.controller';
import { MaterialsController } from '../src/materials/materials.controller';
import { MaterialsService } from '../src/materials/materials.service';
import { TariffsController } from '../src/tariffs/tariffs.controller';
import { TariffsService } from '../src/tariffs/tariffs.service';
import { TimeEntriesController } from '../src/time-entries/time-entries.controller';
import { TimeEntriesService } from '../src/time-entries/time-entries.service';
import { UnitsController } from '../src/units/units.controller';
import { UnitsService } from '../src/units/units.service';

const ETA_ID = '11111111-1111-4111-8111-111111111111';
const USER_ID = '22222222-2222-4222-8222-222222222222';
const RESOURCE_ID = '33333333-3333-4333-8333-333333333333';
const EMPLOYEE_ID = '44444444-4444-4444-8444-444444444444';
const ARTICLE_ID = '55555555-5555-4555-8555-555555555555';
const UNIT_ID = '66666666-6666-4666-8666-666666666666';
const CATEGORY_ID = '77777777-7777-4777-8777-777777777777';

const currentUser: AuthUser = {
  userId: USER_ID,
  email: 'admin@eta.local',
  activeEtaId: ETA_ID,
  memberships: [{ etaId: ETA_ID, role: EtaRole.OWNER }],
};

const currentEta: EtaContext = {
  etaId: ETA_ID,
  role: EtaRole.OWNER,
};

const authGuard: CanActivate = {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    request.user = currentUser;
    return true;
  },
};

const etaContextGuard: CanActivate = {
  canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<{ currentEta?: EtaContext }>();
    request.currentEta = currentEta;
    return true;
  },
};

const etaRolesGuard: CanActivate = {
  canActivate() {
    return true;
  },
};

const authService = {
  login: jest.fn(),
  register: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
};

const etasService = {
  findCurrent: jest.fn(),
};

const clientsService = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const employeesService = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const materialsService = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const articlesService = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const unitsService = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const tariffsService = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findCategories: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
};

const timeEntriesService = {
  create: jest.fn(),
  search: jest.fn(),
  getOverlaps: jest.fn(),
  validate: jest.fn(),
  statsByWeeks: jest.fn(),
  statsByMonths: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const sampleEta = {
  id: ETA_ID,
  name: 'ETA Demo',
  slug: 'eta-demo',
  isActive: true,
};

const sampleClient = {
  id: RESOURCE_ID,
  etaId: ETA_ID,
  displayName: 'Ferme Martin',
  isActive: true,
};

const sampleEmployee = {
  id: EMPLOYEE_ID,
  etaId: ETA_ID,
  firstName: 'Jean',
  lastName: 'Dupont',
  isActive: true,
};

const sampleMaterial = {
  id: RESOURCE_ID,
  etaId: ETA_ID,
  name: 'Tracteur',
  isActive: true,
};

const sampleArticle = {
  id: ARTICLE_ID,
  etaId: ETA_ID,
  code: 'MO',
  name: 'Main oeuvre',
  type: ArticleType.BILLABLE,
  isActive: true,
};

const sampleUnit = {
  id: UNIT_ID,
  etaId: ETA_ID,
  code: 'H',
  label: 'Heure',
  isActive: true,
};

const sampleCategory = {
  id: CATEGORY_ID,
  etaId: ETA_ID,
  name: 'Standard',
  isActive: true,
};

const sampleTariff = {
  id: RESOURCE_ID,
  etaId: ETA_ID,
  articleId: ARTICLE_ID,
  unitId: UNIT_ID,
  categoryId: CATEGORY_ID,
  label: 'Main oeuvre horaire',
  unitPrice: 65,
  isActive: true,
};

const sampleTimeEntry = {
  id: RESOURCE_ID,
  etaId: ETA_ID,
  employeeId: EMPLOYEE_ID,
  articleId: ARTICLE_ID,
  createdByUserId: USER_ID,
  startAt: '2026-05-16T08:00:00.000Z',
  endAt: '2026-05-16T10:00:00.000Z',
  durationMinutes: 120,
  employeeMinutes: 120,
  personalKm: 0,
  personalAmount: 0,
  halfDay: false,
};

const authResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  tokenType: 'Bearer',
  accessTokenExpiresIn: '15m',
};

describe('API routes (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [
        AppController,
        HealthController,
        AuthController,
        EtasController,
        ClientsController,
        EmployeesController,
        MaterialsController,
        ArticlesController,
        UnitsController,
        TariffsController,
        TimeEntriesController,
      ],
      providers: [
        AppService,
        { provide: AuthService, useValue: authService },
        { provide: EtasService, useValue: etasService },
        { provide: ClientsService, useValue: clientsService },
        { provide: EmployeesService, useValue: employeesService },
        { provide: MaterialsService, useValue: materialsService },
        { provide: ArticlesService, useValue: articlesService },
        { provide: UnitsService, useValue: unitsService },
        { provide: TariffsService, useValue: tariffsService },
        { provide: TimeEntriesService, useValue: timeEntriesService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(authGuard)
      .overrideGuard(EtaContextGuard)
      .useValue(etaContextGuard)
      .overrideGuard(EtaRolesGuard)
      .useValue(etaRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    authService.login.mockResolvedValue(authResponse);
    authService.register.mockResolvedValue(authResponse);
    authService.refresh.mockResolvedValue(authResponse);
    authService.logout.mockResolvedValue(undefined);
    authService.me.mockResolvedValue({
      id: USER_ID,
      email: currentUser.email,
      firstName: 'Admin',
      lastName: 'ETA',
      activeEtaId: ETA_ID,
      memberships: [
        { etaId: ETA_ID, etaName: 'ETA Demo', role: EtaRole.OWNER },
      ],
    });

    etasService.findCurrent.mockResolvedValue(sampleEta);
    clientsService.findAll.mockResolvedValue([sampleClient]);
    clientsService.create.mockResolvedValue(sampleClient);
    clientsService.update.mockResolvedValue(sampleClient);
    employeesService.findAll.mockResolvedValue([sampleEmployee]);
    employeesService.create.mockResolvedValue(sampleEmployee);
    employeesService.update.mockResolvedValue(sampleEmployee);
    materialsService.findAll.mockResolvedValue([sampleMaterial]);
    materialsService.create.mockResolvedValue(sampleMaterial);
    materialsService.update.mockResolvedValue(sampleMaterial);
    articlesService.findAll.mockResolvedValue([sampleArticle]);
    articlesService.create.mockResolvedValue(sampleArticle);
    articlesService.update.mockResolvedValue(sampleArticle);
    unitsService.findAll.mockResolvedValue([sampleUnit]);
    unitsService.create.mockResolvedValue(sampleUnit);
    unitsService.update.mockResolvedValue(sampleUnit);
    tariffsService.findAll.mockResolvedValue([sampleTariff]);
    tariffsService.create.mockResolvedValue(sampleTariff);
    tariffsService.update.mockResolvedValue(sampleTariff);
    tariffsService.findCategories.mockResolvedValue([sampleCategory]);
    tariffsService.createCategory.mockResolvedValue(sampleCategory);
    tariffsService.updateCategory.mockResolvedValue(sampleCategory);
    timeEntriesService.create.mockResolvedValue(sampleTimeEntry);
    timeEntriesService.search.mockResolvedValue([sampleTimeEntry]);
    timeEntriesService.getOverlaps.mockResolvedValue([sampleTimeEntry]);
    timeEntriesService.validate.mockResolvedValue({ validated: 1 });
    timeEntriesService.statsByWeeks.mockResolvedValue([
      {
        year: 2026,
        week: 20,
        weekStart: '11/05/2026',
        weekEnd: '17/05/2026',
        totalMinutes: 120,
      },
    ]);
    timeEntriesService.statsByMonths.mockResolvedValue([
      {
        month: '05/2026',
        personalKm: 0,
        personalAmount: 0,
        clientWork: 120,
        absence: 0,
        travel: 0,
        maintenance: 0,
        etaWork: 0,
      },
    ]);
    timeEntriesService.findOne.mockResolvedValue(sampleTimeEntry);
    timeEntriesService.update.mockResolvedValue(sampleTimeEntry);
    timeEntriesService.remove.mockResolvedValue(sampleTimeEntry);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login', async () => {
    const body = { email: 'admin@eta.local', password: 'ChangeMe123!' };

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('user-agent', 'jest')
      .send(body)
      .expect(200)
      .expect(({ body: response }) => {
        expect(response).toMatchObject(authResponse);
      });

    expect(authService.login).toHaveBeenCalledWith(
      body,
      expect.any(String),
      'jest',
    );
  });

  it('POST /api/auth/register', async () => {
    const body = {
      email: 'new-admin@eta.local',
      password: 'ChangeMe123!',
      etaName: 'Nouvelle ETA',
    };

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .set('user-agent', 'jest')
      .send(body)
      .expect(201)
      .expect(({ body: response }) => {
        expect(response).toMatchObject(authResponse);
      });

    expect(authService.register).toHaveBeenCalledWith(
      body,
      expect.any(String),
      'jest',
    );
  });

  it('POST /api/auth/refresh', async () => {
    const body = { refreshToken: 'refresh-token' };

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('user-agent', 'jest')
      .send(body)
      .expect(200);

    expect(authService.refresh).toHaveBeenCalledWith(
      body,
      expect.any(String),
      'jest',
    );
  });

  it('POST /api/auth/logout', async () => {
    const body = { refreshToken: 'refresh-token' };

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .send(body)
      .expect(200)
      .expect({ success: true });

    expect(authService.logout).toHaveBeenCalledWith(currentUser, body);
  });

  it('GET /api/auth/me', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(200);

    expect(authService.me).toHaveBeenCalledWith(currentUser);
  });

  it('GET /api/etas/current', async () => {
    await request(app.getHttpServer()).get('/api/etas/current').expect(200);

    expect(etasService.findCurrent).toHaveBeenCalledWith(ETA_ID);
  });

  describe.each([
    {
      name: 'clients',
      path: '/api/clients',
      service: clientsService,
      createBody: { displayName: 'Ferme Martin' },
      updateBody: { notes: 'Updated notes' },
    },
    {
      name: 'employees',
      path: '/api/employees',
      service: employeesService,
      createBody: { firstName: 'Jean', lastName: 'Dupont' },
      updateBody: { dailyMinutes: 390 },
    },
    {
      name: 'materials',
      path: '/api/materials',
      service: materialsService,
      createBody: { name: 'Tracteur' },
      updateBody: { analyticCode: 'AN-001' },
    },
    {
      name: 'articles',
      path: '/api/articles',
      service: articlesService,
      createBody: {
        code: 'MO',
        name: 'Main oeuvre',
        type: ArticleType.BILLABLE,
      },
      updateBody: { name: 'Main oeuvre qualifiee' },
    },
    {
      name: 'units',
      path: '/api/units',
      service: unitsService,
      createBody: { code: 'H', label: 'Heure' },
      updateBody: { label: 'Heure machine' },
    },
  ])('$name routes', ({ path, service, createBody, updateBody }) => {
    it(`GET ${path}`, async () => {
      await request(app.getHttpServer()).get(path).expect(200);

      expect(service.findAll).toHaveBeenCalledWith(ETA_ID);
    });

    it(`POST ${path}`, async () => {
      await request(app.getHttpServer())
        .post(path)
        .send(createBody)
        .expect(201);

      expect(service.create).toHaveBeenCalledWith(ETA_ID, createBody);
    });

    it(`PATCH ${path}/:id`, async () => {
      await request(app.getHttpServer())
        .patch(`${path}/${RESOURCE_ID}`)
        .send(updateBody)
        .expect(200);

      expect(service.update).toHaveBeenCalledWith(
        ETA_ID,
        RESOURCE_ID,
        updateBody,
      );
    });
  });

  it('rejects invalid client payloads', async () => {
    await request(app.getHttpServer())
      .post('/api/clients')
      .send({ unknown: 'field' })
      .expect(400);
  });

  it('GET /api/tariffs', async () => {
    await request(app.getHttpServer())
      .get('/api/tariffs')
      .query({ articleId: ARTICLE_ID })
      .expect(200);

    expect(tariffsService.findAll).toHaveBeenCalledWith(ETA_ID, ARTICLE_ID);
  });

  it('POST /api/tariffs', async () => {
    const body = {
      articleId: ARTICLE_ID,
      unitId: UNIT_ID,
      categoryId: CATEGORY_ID,
      label: 'Main oeuvre horaire',
      unitPrice: 65,
    };

    await request(app.getHttpServer())
      .post('/api/tariffs')
      .send(body)
      .expect(201);

    expect(tariffsService.create).toHaveBeenCalledWith(ETA_ID, body);
  });

  it('PATCH /api/tariffs/:id', async () => {
    const body = { label: 'Main oeuvre speciale' };

    await request(app.getHttpServer())
      .patch(`/api/tariffs/${RESOURCE_ID}`)
      .send(body)
      .expect(200);

    expect(tariffsService.update).toHaveBeenCalledWith(
      ETA_ID,
      RESOURCE_ID,
      body,
    );
  });

  it('GET /api/tariffs/categories', async () => {
    await request(app.getHttpServer())
      .get('/api/tariffs/categories')
      .expect(200);

    expect(tariffsService.findCategories).toHaveBeenCalledWith(ETA_ID);
  });

  it('POST /api/tariffs/categories', async () => {
    const body = { name: 'Standard' };

    await request(app.getHttpServer())
      .post('/api/tariffs/categories')
      .send(body)
      .expect(201);

    expect(tariffsService.createCategory).toHaveBeenCalledWith(ETA_ID, body);
  });

  it('PATCH /api/tariffs/categories/:id', async () => {
    const body = { name: 'Special' };

    await request(app.getHttpServer())
      .patch(`/api/tariffs/categories/${CATEGORY_ID}`)
      .send(body)
      .expect(200);

    expect(tariffsService.updateCategory).toHaveBeenCalledWith(
      ETA_ID,
      CATEGORY_ID,
      body,
    );
  });

  it('POST /api/time-entries', async () => {
    const body = {
      employeeId: EMPLOYEE_ID,
      articleId: ARTICLE_ID,
      startAt: '2026-05-16T08:00:00.000Z',
      endAt: '2026-05-16T10:00:00.000Z',
    };

    await request(app.getHttpServer())
      .post('/api/time-entries')
      .send(body)
      .expect(201);

    expect(timeEntriesService.create).toHaveBeenCalledWith(
      currentEta,
      currentUser,
      body,
    );
  });

  it('POST /api/time-entries/search', async () => {
    const body = { employeeIds: [EMPLOYEE_ID] };

    await request(app.getHttpServer())
      .post('/api/time-entries/search')
      .send(body)
      .expect(200);

    expect(timeEntriesService.search).toHaveBeenCalledWith(
      currentEta,
      currentUser,
      body,
    );
  });

  it('GET /api/time-entries/overlaps', async () => {
    const query = {
      employeeId: EMPLOYEE_ID,
      start: '2026-05-16T08:00:00.000Z',
      end: '2026-05-16T10:00:00.000Z',
    };

    await request(app.getHttpServer())
      .get('/api/time-entries/overlaps')
      .query(query)
      .expect(200);

    expect(timeEntriesService.getOverlaps).toHaveBeenCalledWith(
      currentEta,
      currentUser,
      query,
    );
  });

  it('POST /api/time-entries/validate', async () => {
    const body = { timeEntryIds: [RESOURCE_ID] };

    await request(app.getHttpServer())
      .post('/api/time-entries/validate')
      .send(body)
      .expect(200);

    expect(timeEntriesService.validate).toHaveBeenCalledWith(
      currentEta,
      currentUser,
      body.timeEntryIds,
    );
  });

  it('POST /api/time-entries/stats/weeks', async () => {
    const body = {
      start: '2026-05-01T00:00:00.000Z',
      end: '2026-05-31T23:59:59.000Z',
    };

    await request(app.getHttpServer())
      .post('/api/time-entries/stats/weeks')
      .send(body)
      .expect(200);

    expect(timeEntriesService.statsByWeeks).toHaveBeenCalledWith(
      currentEta,
      currentUser,
      body,
    );
  });

  it('POST /api/time-entries/stats/months', async () => {
    const body = {
      start: '2026-05-01T00:00:00.000Z',
      end: '2026-05-31T23:59:59.000Z',
    };

    await request(app.getHttpServer())
      .post('/api/time-entries/stats/months')
      .send(body)
      .expect(200);

    expect(timeEntriesService.statsByMonths).toHaveBeenCalledWith(
      currentEta,
      currentUser,
      body,
    );
  });

  it('GET /api/time-entries/:id', async () => {
    await request(app.getHttpServer())
      .get(`/api/time-entries/${RESOURCE_ID}`)
      .expect(200);

    expect(timeEntriesService.findOne).toHaveBeenCalledWith(
      currentEta,
      currentUser,
      RESOURCE_ID,
    );
  });

  it('PATCH /api/time-entries/:id', async () => {
    const body = { comment: 'Updated comment' };

    await request(app.getHttpServer())
      .patch(`/api/time-entries/${RESOURCE_ID}`)
      .send(body)
      .expect(200);

    expect(timeEntriesService.update).toHaveBeenCalledWith(
      currentEta,
      currentUser,
      RESOURCE_ID,
      body,
    );
  });

  it('DELETE /api/time-entries/:id', async () => {
    await request(app.getHttpServer())
      .delete(`/api/time-entries/${RESOURCE_ID}`)
      .expect(200);

    expect(timeEntriesService.remove).toHaveBeenCalledWith(
      currentEta,
      currentUser,
      RESOURCE_ID,
    );
  });
});
