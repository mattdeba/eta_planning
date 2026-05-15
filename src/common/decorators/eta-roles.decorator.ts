import { SetMetadata } from '@nestjs/common';
import { EtaRole } from '../enums/eta-role.enum';

export const ETA_ROLES_KEY = 'eta_roles';

export const EtaRoles = (...roles: EtaRole[]) =>
  SetMetadata(ETA_ROLES_KEY, roles);
