import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const configService = app.get(ConfigService);
    const apiPrefix = configService.get<string>('API_PREFIX', 'api');

    if (apiPrefix) {
      app.setGlobalPrefix(apiPrefix);
    }

    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          name: 'my_eta_planning_backend',
        });
      });
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect(({ body }: { body: { status: string } }) => {
        expect(body.status).toBe('ok');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
