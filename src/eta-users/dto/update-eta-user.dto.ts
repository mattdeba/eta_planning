import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { EtaRole } from '../../common/enums/eta-role.enum';

export class UpdateEtaUserDto {
  @ApiPropertyOptional({ maxLength: 255, nullable: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(255)
  firstName?: string | null;

  @ApiPropertyOptional({ maxLength: 255, nullable: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lastName?: string | null;

  @ApiPropertyOptional({ enum: [EtaRole.ADMIN, EtaRole.EMPLOYEE] })
  @IsOptional()
  @IsIn([EtaRole.ADMIN, EtaRole.EMPLOYEE])
  role?: EtaRole.ADMIN | EtaRole.EMPLOYEE;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string | null;
}
