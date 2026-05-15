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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  timeEntryId: string;

  @Column({ type: 'uuid' })
  tariffId: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 3,
    transformer: numericTransformer,
  })
  quantity: number;

  @ManyToOne(() => TimeEntry, (timeEntry) => timeEntry.quantities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'timeEntryId' })
  timeEntry: TimeEntry;

  @ManyToOne(() => Tariff, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tariffId' })
  tariff: Tariff;
}
