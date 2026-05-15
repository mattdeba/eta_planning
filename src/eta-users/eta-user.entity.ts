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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  etaId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: EtaRole })
  role: EtaRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Eta, (eta) => eta.etaUsers, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'etaId' })
  eta: Eta;

  @ManyToOne(() => User, (user) => user.etaUsers, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
