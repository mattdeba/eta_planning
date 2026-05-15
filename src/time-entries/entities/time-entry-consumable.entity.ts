import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Article } from '../../articles/article.entity';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { Material } from '../../materials/material.entity';
import { Tariff } from '../../tariffs/tariff.entity';
import { TimeEntry } from './time-entry.entity';

@Entity({ name: 'time_entry_consumables' })
@Index('IDX_time_entry_consumables_timeEntryId', ['timeEntryId'])
export class TimeEntryConsumable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  timeEntryId: string;

  @Column({ type: 'uuid', nullable: true })
  materialId: string | null;

  @Column({ type: 'uuid' })
  articleId: string;

  @Column({ type: 'uuid', nullable: true })
  tariffId: string | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 3,
    transformer: numericTransformer,
  })
  quantity: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  meterStart: number | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  meterEnd: number | null;

  @ManyToOne(() => TimeEntry, (timeEntry) => timeEntry.consumables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'timeEntryId' })
  timeEntry: TimeEntry;

  @ManyToOne(() => Material, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'materialId' })
  material: Material | null;

  @ManyToOne(() => Article, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @ManyToOne(() => Tariff, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'tariffId' })
  tariff: Tariff | null;
}
