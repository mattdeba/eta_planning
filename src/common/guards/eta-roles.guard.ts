import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EtaRole } from '../enums/eta-role.enum';
import { ETA_ROLES_KEY } from '../decorators/eta-roles.decorator';
import type { RequestWithEtaContext } from '../interfaces/request-with-eta-context.interface';

@Injectable()
export class EtaRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<EtaRole[]>(ETA_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithEtaContext>();
    const currentEta = request.currentEta;

    if (!currentEta) {
      throw new ForbiddenException('ETA context is required.');
    }

    if (currentEta.role === EtaRole.OWNER || roles.includes(currentEta.role)) {
      return true;
    }

    throw new ForbiddenException('Insufficient ETA role.');
  }
}
