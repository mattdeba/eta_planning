import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Eta } from '../etas/eta.entity';
import { EtaUser } from './eta-user.entity';
import { EtaUsersService } from './eta-users.service';

@Module({
  imports: [TypeOrmModule.forFeature([EtaUser, Eta])],
  providers: [EtaUsersService],
  exports: [EtaUsersService],
})
export class EtaUsersModule {}
