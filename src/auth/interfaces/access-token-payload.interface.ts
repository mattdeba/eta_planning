import { EtaRole } from '../../common/enums/eta-role.enum';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  activeEtaId: string;
  memberships: {
    etaId: string;
    role: EtaRole;
  }[];
}
