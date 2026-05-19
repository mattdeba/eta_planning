import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { Employee } from '../employees/employee.entity';
import { Eta } from '../etas/eta.entity';
import { User } from '../users/user.entity';
import { EtaUser } from './eta-user.entity';
import { EtaUsersController } from './eta-users.controller';
import { EtaUsersService } from './eta-users.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([EtaUser, Eta, User, Employee]),
    CommonModule,
  ],
  controllers: [EtaUsersController],
  providers: [EtaUsersService],
  exports: [EtaUsersService],
})
export class EtaUsersModule {}
