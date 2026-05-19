import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtaUser } from '../eta-users/eta-user.entity';
import { EtaContextGuard } from './guards/eta-context.guard';
import { EtaRolesGuard } from './guards/eta-roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([EtaUser])],
  providers: [EtaContextGuard, EtaRolesGuard],
  exports: [EtaContextGuard, EtaRolesGuard],
})
export class CommonModule {}
