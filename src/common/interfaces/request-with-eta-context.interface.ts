import type { IncomingHttpHeaders } from 'node:http';
import type { AuthUser } from '../../auth/interfaces/auth-user.interface';
import type { EtaContext } from './eta-context.interface';

export interface RequestWithEtaContext {
  headers: IncomingHttpHeaders;
  user?: AuthUser;
  currentEta?: EtaContext;
}
