import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
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

@Entity({ name: 'materials' })
@Index('IDX_materials_etaId', ['etaId'])
@Unique('UQ_materials_etaId_code', ['etaId', 'code'])
export class Material {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  etaId: string;

  @ApiProperty({ nullable: true, maxLength: 64, example: 'MAT-001' })
  @Column({ type: 'varchar', length: 64, nullable: true })
  code: string | null;

  @ApiProperty({ maxLength: 255, example: 'Tracteur 150 CV' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ nullable: true, maxLength: 128, example: 'AB-123-CD' })
  @Column({ type: 'varchar', length: 128, nullable: true })
  registrationNumber: string | null;

  @ApiProperty({ nullable: true, maxLength: 128, example: 'AN-MAT-001' })
  @Column({ type: 'varchar', length: 128, nullable: true })
  analyticCode: string | null;

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
}
