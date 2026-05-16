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
import { User } from '../users/user.entity';

@Entity({ name: 'employees' })
@Index('IDX_employees_etaId', ['etaId'])
@Unique('UQ_employees_etaId_code', ['etaId', 'code'])
@Unique('UQ_employees_etaId_userId', ['etaId', 'userId'])
export class Employee {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  etaId: string;

  @ApiProperty({ nullable: true, format: 'uuid' })
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ApiProperty({ nullable: true, maxLength: 64, example: 'SAL-001' })
  @Column({ type: 'varchar', length: 64, nullable: true })
  code: string | null;

  @ApiProperty({ maxLength: 255, example: 'Jean' })
  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @ApiProperty({ maxLength: 255, example: 'Dupont' })
  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @ApiProperty({
    nullable: true,
    maxLength: 255,
    example: 'jean.dupont@example.test',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @ApiProperty({ nullable: true, maxLength: 64, example: '+33102030405' })
  @Column({ type: 'varchar', length: 64, nullable: true })
  phone: string | null;

  @ApiProperty({ example: 420 })
  @Column({ type: 'integer', default: 420 })
  dailyMinutes: number;

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

  @ApiHideProperty()
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User | null;
}
