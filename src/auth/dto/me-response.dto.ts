import { ApiProperty } from '@nestjs/swagger';
import { EtaRole } from '../../common/enums/eta-role.enum';

export class MeMembershipDto {
  @ApiProperty({ format: 'uuid' })
  etaId: string;

  @ApiProperty({ nullable: true, example: 'ETA Demo' })
  etaName: string | null;

  @ApiProperty({ enum: EtaRole, example: EtaRole.OWNER })
  role: EtaRole;
}

export class MeResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'admin@eta.local' })
  email: string;

  @ApiProperty({ nullable: true, example: 'Admin' })
  firstName: string | null;

  @ApiProperty({ nullable: true, example: 'ETA' })
  lastName: string | null;

  @ApiProperty({ format: 'uuid' })
  activeEtaId: string;

  @ApiProperty({ type: [MeMembershipDto] })
  memberships: MeMembershipDto[];
}
