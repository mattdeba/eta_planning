import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { Material } from '../../materials/material.entity';
import { TimeEntry } from './time-entry.entity';

@Entity({ name: 'time_entry_materials' })
@Index('IDX_time_entry_materials_timeEntryId', ['timeEntryId'])
@Index('IDX_time_entry_materials_materialId', ['materialId'])
export class TimeEntryMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  timeEntryId: string;

  @Column({ type: 'uuid' })
  materialId: string;

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

  @ManyToOne(() => TimeEntry, (timeEntry) => timeEntry.materials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'timeEntryId' })
  timeEntry: TimeEntry;

  @ManyToOne(() => Material, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'materialId' })
  material: Material;
}
