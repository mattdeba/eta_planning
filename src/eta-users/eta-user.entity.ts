import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EtaRole } from '../common/enums/eta-role.enum';
import { Eta } from '../etas/eta.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'eta_users' })
@Unique('UQ_eta_users_etaId_userId', ['etaId', 'userId'])
export class EtaUser {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  etaId: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ enum: EtaRole })
  @Column({ type: 'enum', enum: EtaRole })
  role: EtaRole;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ format: 'date-time' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiHideProperty()
  @ManyToOne(() => Eta, (eta) => eta.etaUsers, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'etaId' })
  eta: Eta;

  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.etaUsers, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
