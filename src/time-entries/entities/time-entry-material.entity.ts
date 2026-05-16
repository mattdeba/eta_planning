import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  timeEntryId: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  materialId: string;

  @ApiProperty({ nullable: true, example: 1234.5 })
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  meterStart: number | null;

  @ApiProperty({ nullable: true, example: 1240.5 })
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  meterEnd: number | null;

  @ApiHideProperty()
  @ManyToOne(() => TimeEntry, (timeEntry) => timeEntry.materials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'timeEntryId' })
  timeEntry: TimeEntry;

  @ApiProperty({ type: () => Material })
  @ManyToOne(() => Material, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'materialId' })
  material: Material;
}
