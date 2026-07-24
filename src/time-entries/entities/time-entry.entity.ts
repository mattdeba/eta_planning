import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
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
@Index('IDX_time_entries_etaId_date', ['etaId', 'date'])
@Index('IDX_time_entries_etaId_employeeId', ['etaId', 'employeeId'])
export class TimeEntry {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  etaId: string;

  @ApiProperty({ nullable: true, format: 'uuid' })
  @Column({ type: 'uuid', nullable: true })
  clientId: string | null;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  employeeId: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  articleId: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  createdByUserId: string;

  @ApiProperty({ format: 'date', example: '2026-05-16' })
  @Column({ type: 'date' })
  date: string;

  @ApiProperty({ nullable: true, format: 'date-time' })
  @Column({ type: 'timestamptz', nullable: true })
  startAt: Date | null;

  @ApiProperty({ nullable: true, format: 'date-time' })
  @Column({ type: 'timestamptz', nullable: true })
  endAt: Date | null;

  @ApiProperty({ nullable: true, example: 'Travail de preparation.' })
  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @ApiProperty({ example: 12.5 })
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  personalKm: number;

  @ApiProperty({ example: 8.5 })
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  personalAmount: number;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  halfDay: boolean;

  @ApiProperty({ nullable: true, format: 'date-time' })
  @Column({ type: 'timestamptz', nullable: true })
  validatedAt: Date | null;

  @ApiProperty({ nullable: true, format: 'uuid' })
  @Column({ type: 'uuid', nullable: true })
  validatedByUserId: string | null;

  @ApiProperty({ format: 'date-time' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiHideProperty()
  @ManyToOne(() => Eta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'etaId' })
  eta: Eta;

  @ApiProperty({ type: () => Client, nullable: true })
  @ManyToOne(() => Client, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clientId' })
  client: Client | null;

  @ApiProperty({ type: () => Employee })
  @ManyToOne(() => Employee, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ApiProperty({ type: () => Article })
  @ManyToOne(() => Article, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User;

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'validatedByUserId' })
  validatedByUser: User | null;

  @ApiProperty({ type: () => [TimeEntryMaterial] })
  @OneToMany(() => TimeEntryMaterial, (material) => material.timeEntry)
  materials: TimeEntryMaterial[];

  @ApiProperty({ type: () => [TimeEntryQuantity] })
  @OneToMany(() => TimeEntryQuantity, (quantity) => quantity.timeEntry)
  quantities: TimeEntryQuantity[];

  @ApiProperty({ type: () => [TimeEntryConsumable] })
  @OneToMany(() => TimeEntryConsumable, (consumable) => consumable.timeEntry)
  consumables: TimeEntryConsumable[];
}
