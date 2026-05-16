import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  timeEntryId: string;

  @ApiProperty({ nullable: true, format: 'uuid' })
  @Column({ type: 'uuid', nullable: true })
  materialId: string | null;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  articleId: string;

  @ApiProperty({ nullable: true, format: 'uuid' })
  @Column({ type: 'uuid', nullable: true })
  tariffId: string | null;

  @ApiProperty({ example: 12.5 })
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 3,
    transformer: numericTransformer,
  })
  quantity: number;

  @ApiProperty({ nullable: true, example: 1100 })
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  meterStart: number | null;

  @ApiProperty({ nullable: true, example: 1112.5 })
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  meterEnd: number | null;

  @ApiHideProperty()
  @ManyToOne(() => TimeEntry, (timeEntry) => timeEntry.consumables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'timeEntryId' })
  timeEntry: TimeEntry;

  @ApiProperty({ type: () => Material, nullable: true })
  @ManyToOne(() => Material, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'materialId' })
  material: Material | null;

  @ApiProperty({ type: () => Article })
  @ManyToOne(() => Article, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @ApiProperty({ type: () => Tariff, nullable: true })
  @ManyToOne(() => Tariff, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'tariffId' })
  tariff: Tariff | null;
}
