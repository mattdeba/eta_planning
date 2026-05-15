import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { Eta } from './eta.entity';
import { EtasController } from './etas.controller';
import { EtasService } from './etas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Eta]), CommonModule],
  controllers: [EtasController],
  providers: [EtasService],
  exports: [EtasService],
})
export class EtasModule {}
