import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Eta } from '../etas/eta.entity';
import { Unit } from '../units/unit.entity';
import { ArticleType } from './enums/article-type.enum';

@Entity({ name: 'articles' })
@Index('IDX_articles_etaId', ['etaId'])
@Unique('UQ_articles_etaId_code', ['etaId', 'code'])
export class Article {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  etaId: string;

  @ApiProperty({ maxLength: 64, example: 'MO' })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @ApiProperty({ maxLength: 255, example: 'Main oeuvre' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ enum: ArticleType })
  @Column({
    type: 'enum',
    enum: ArticleType,
    enumName: 'article_type_enum',
  })
  type: ArticleType;

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

  @ApiProperty({ type: () => [Unit] })
  @ManyToMany(() => Unit)
  @JoinTable({
    name: 'article_units',
    joinColumn: { name: 'articleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'unitId', referencedColumnName: 'id' },
  })
  units: Unit[];
}
