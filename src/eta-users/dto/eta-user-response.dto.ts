import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '../../employees/employee.entity';
import { EtaRole } from '../../common/enums/eta-role.enum';

export class EtaUserAccountDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  etaId: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ example: 'employee@eta.local' })
  email: string;

  @ApiProperty({ nullable: true, example: 'Jean' })
  firstName: string | null;

  @ApiProperty({ nullable: true, example: 'Dupont' })
  lastName: string | null;

  @ApiProperty({ enum: EtaRole })
  role: EtaRole;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({ type: () => Employee, nullable: true })
  employee: Employee | null;
}
