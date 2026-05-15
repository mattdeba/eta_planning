import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from '../articles/article.entity';
import { numericTransformer } from '../common/transformers/numeric.transformer';
import { Eta } from '../etas/eta.entity';
import { Unit } from '../units/unit.entity';
import { TariffCategory } from './tariff-category.entity';

@Entity({ name: 'tariffs' })
@Index('IDX_tariffs_etaId', ['etaId'])
export class Tariff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  etaId: string;

  @Column({ type: 'uuid' })
  articleId: string;

  @Column({ type: 'uuid' })
  unitId: string;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 4,
    nullable: true,
    transformer: numericTransformer,
  })
  unitPrice: number | null;

  @Column({ type: 'date', nullable: true })
  validFrom: string | null;

  @Column({ type: 'date', nullable: true })
  validTo: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Eta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'etaId' })
  eta: Eta;

  @ManyToOne(() => Article, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @ManyToOne(() => Unit, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @ManyToOne(() => TariffCategory, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: TariffCategory | null;
}
