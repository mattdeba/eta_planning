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

@Entity({ name: 'clients' })
@Index('IDX_clients_etaId', ['etaId'])
@Unique('UQ_clients_etaId_code', ['etaId', 'code'])
export class Client {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  etaId: string;

  @ApiProperty({ nullable: true, maxLength: 64, example: 'CL-001' })
  @Column({ type: 'varchar', length: 64, nullable: true })
  code: string | null;

  @ApiProperty({ maxLength: 255, example: 'Ferme Martin' })
  @Column({ type: 'varchar', length: 255 })
  displayName: string;

  @ApiProperty({ nullable: true, maxLength: 255, example: 'Paul Martin' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  contactName: string | null;

  @ApiProperty({
    nullable: true,
    maxLength: 255,
    example: 'paul.martin@example.test',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @ApiProperty({ nullable: true, maxLength: 64, example: '+33102030405' })
  @Column({ type: 'varchar', length: 64, nullable: true })
  phone: string | null;

  @ApiProperty({ nullable: true, example: 'Client prioritaire.' })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

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
