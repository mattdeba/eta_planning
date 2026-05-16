import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 255 })
  tokenHash: string;

  @ApiProperty({ format: 'date-time' })
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @ApiProperty({ nullable: true, format: 'date-time' })
  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @ApiProperty({ nullable: true, maxLength: 255 })
  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress: string | null;

  @ApiProperty({ nullable: true, maxLength: 1000 })
  @Column({ type: 'varchar', length: 1000, nullable: true })
  userAgent: string | null;

  @ApiProperty({ format: 'date-time' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
