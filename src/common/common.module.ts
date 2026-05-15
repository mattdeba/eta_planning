import { Module } from '@nestjs/common';
import { EtaContextGuard } from './guards/eta-context.guard';
import { EtaRolesGuard } from './guards/eta-roles.guard';

@Module({
  providers: [EtaContextGuard, EtaRolesGuard],
  exports: [EtaContextGuard, EtaRolesGuard],
})
export class CommonModule {}
