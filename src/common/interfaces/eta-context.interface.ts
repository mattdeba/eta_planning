import { EtaRole } from '../enums/eta-role.enum';

export interface EtaContext {
  etaId: string;
  role: EtaRole;
}
