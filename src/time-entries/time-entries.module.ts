import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/article.entity';
import { Client } from '../clients/client.entity';
import { CommonModule } from '../common/common.module';
import { Employee } from '../employees/employee.entity';
import { Material } from '../materials/material.entity';
import { Tariff } from '../tariffs/tariff.entity';
import { TimeEntryConsumable } from './entities/time-entry-consumable.entity';
import { TimeEntryMaterial } from './entities/time-entry-material.entity';
import { TimeEntryQuantity } from './entities/time-entry-quantity.entity';
import { TimeEntry } from './entities/time-entry.entity';
import { TimeEntriesController } from './time-entries.controller';
import { TimeEntriesService } from './time-entries.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TimeEntry,
      TimeEntryMaterial,
      TimeEntryQuantity,
      TimeEntryConsumable,
      Client,
      Employee,
      Material,
      Article,
      Tariff,
    ]),
    CommonModule,
  ],
  controllers: [TimeEntriesController],
  providers: [TimeEntriesService],
  exports: [TimeEntriesService],
})
export class TimeEntriesModule {}
