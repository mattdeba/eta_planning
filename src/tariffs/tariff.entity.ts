import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  etaId: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  articleId: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  unitId: string;

  @ApiProperty({ nullable: true, format: 'uuid' })
  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  @ApiProperty({ maxLength: 255, example: 'Main oeuvre horaire' })
  @Column({ type: 'varchar', length: 255 })
  label: string;

  @ApiProperty({ nullable: true, example: 65 })
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 4,
    nullable: true,
    transformer: numericTransformer,
  })
  unitPrice: number | null;

  @ApiProperty({ nullable: true, format: 'date', example: '2026-01-01' })
  @Column({ type: 'date', nullable: true })
  validFrom: string | null;

  @ApiProperty({ nullable: true, format: 'date', example: '2026-12-31' })
  @Column({ type: 'date', nullable: true })
  validTo: string | null;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

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

  @ApiProperty({ type: () => Article })
  @ManyToOne(() => Article, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @ApiProperty({ type: () => Unit })
  @ManyToOne(() => Unit, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @ApiProperty({ type: () => TariffCategory, nullable: true })
  @ManyToOne(() => TariffCategory, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: TariffCategory | null;
}
