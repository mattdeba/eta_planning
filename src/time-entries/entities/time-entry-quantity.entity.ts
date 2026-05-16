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
import { Tariff } from '../../tariffs/tariff.entity';
import { TimeEntry } from './time-entry.entity';

@Entity({ name: 'time_entry_quantities' })
@Index('IDX_time_entry_quantities_timeEntryId', ['timeEntryId'])
export class TimeEntryQuantity {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  timeEntryId: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  tariffId: string;

  @ApiProperty({ example: 3.5 })
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 3,
    transformer: numericTransformer,
  })
  quantity: number;

  @ApiHideProperty()
  @ManyToOne(() => TimeEntry, (timeEntry) => timeEntry.quantities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'timeEntryId' })
  timeEntry: TimeEntry;

  @ApiProperty({ type: () => Tariff })
  @ManyToOne(() => Tariff, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tariffId' })
  tariff: Tariff;
}
