import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Eta } from '../etas/eta.entity';

@Entity({ name: 'tariff_categories' })
@Index('IDX_tariff_categories_etaId', ['etaId'])
@Unique('UQ_tariff_categories_etaId_name', ['etaId', 'name'])
export class TariffCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  etaId: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Eta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'etaId' })
  eta: Eta;
}
