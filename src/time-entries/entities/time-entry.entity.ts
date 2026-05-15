import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from '../../articles/article.entity';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { Client } from '../../clients/client.entity';
import { Employee } from '../../employees/employee.entity';
import { Eta } from '../../etas/eta.entity';
import { User } from '../../users/user.entity';
import { TimeEntryConsumable } from './time-entry-consumable.entity';
import { TimeEntryMaterial } from './time-entry-material.entity';
import { TimeEntryQuantity } from './time-entry-quantity.entity';

@Entity({ name: 'time_entries' })
@Index('IDX_time_entries_etaId_startAt', ['etaId', 'startAt'])
@Index('IDX_time_entries_etaId_employeeId', ['etaId', 'employeeId'])
export class TimeEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  etaId: string;

  @Column({ type: 'uuid', nullable: true })
  clientId: string | null;

  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'uuid' })
  articleId: string;

  @Column({ type: 'uuid' })
  createdByUserId: string;

  @Column({ type: 'timestamptz' })
  startAt: Date;

  @Column({ type: 'timestamptz' })
  endAt: Date;

  @Column({ type: 'integer' })
  durationMinutes: number;

  @Column({ type: 'integer' })
  employeeMinutes: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  personalKm: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  personalAmount: number;

  @Column({ type: 'boolean', default: false })
  halfDay: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  validatedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  validatedByUserId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Eta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'etaId' })
  eta: Eta;

  @ManyToOne(() => Client, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clientId' })
  client: Client | null;

  @ManyToOne(() => Employee, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ManyToOne(() => Article, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'validatedByUserId' })
  validatedByUser: User | null;

  @OneToMany(() => TimeEntryMaterial, (material) => material.timeEntry)
  materials: TimeEntryMaterial[];

  @OneToMany(() => TimeEntryQuantity, (quantity) => quantity.timeEntry)
  quantities: TimeEntryQuantity[];

  @OneToMany(() => TimeEntryConsumable, (consumable) => consumable.timeEntry)
  consumables: TimeEntryConsumable[];
}
