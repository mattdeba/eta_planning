import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EtaUser } from '../eta-users/eta-user.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'admin@eta.local' })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @ApiProperty({ nullable: true, example: 'Admin' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true, example: 'ETA' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName: string | null;

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
  @OneToMany(() => EtaUser, (etaUser) => etaUser.user)
  etaUsers: EtaUser[];

  @ApiHideProperty()
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}
