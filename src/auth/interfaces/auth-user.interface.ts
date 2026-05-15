import { EtaRole } from '../../common/enums/eta-role.enum';

export interface AuthUser {
  userId: string;
  email: string;
  activeEtaId: string;
  memberships: {
    etaId: string;
    role: EtaRole;
  }[];
}
