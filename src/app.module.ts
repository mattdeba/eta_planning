import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { ClientsModule } from './clients/clients.module';
import { environmentValidationSchema } from './config/environment.validation';
import { DatabaseModule } from './database/database.module';
import { EmployeesModule } from './employees/employees.module';
import { EtasModule } from './etas/etas.module';
import { HealthModule } from './health/health.module';
import { MaterialsModule } from './materials/materials.module';
import { TariffsModule } from './tariffs/tariffs.module';
import { TimeEntriesModule } from './time-entries/time-entries.module';
import { UnitsModule } from './units/units.module';

const nodeEnv = process.env.NODE_ENV ?? 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${nodeEnv}.local`, `.env.${nodeEnv}`, '.env'],
      isGlobal: true,
      validationSchema: environmentValidationSchema,
    }),
    DatabaseModule,
    AuthModule,
    EtasModule,
    ClientsModule,
    EmployeesModule,
    MaterialsModule,
    ArticlesModule,
    UnitsModule,
    TariffsModule,
    TimeEntriesModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
