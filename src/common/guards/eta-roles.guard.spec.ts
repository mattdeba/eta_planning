import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ETA_ROLES_KEY } from '../decorators/eta-roles.decorator';
import { EtaRole } from '../enums/eta-role.enum';
import type { RequestWithEtaContext } from '../interfaces/request-with-eta-context.interface';
import { EtaRolesGuard } from './eta-roles.guard';

function createExecutionContext(
  request: RequestWithEtaContext,
): ExecutionContext {
  const handler = () => undefined;
  class Controller {}

  return {
    getHandler: () => handler,
    getClass: () => Controller,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('EtaRolesGuard', () => {
  function buildGuard(roles?: EtaRole[]) {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) =>
        key === ETA_ROLES_KEY ? roles : undefined,
      ),
    } as unknown as Reflector;

    return new EtaRolesGuard(reflector);
  }

  it('allows routes without role metadata', () => {
    const guard = buildGuard();
    const request: RequestWithEtaContext = {
      headers: {},
      currentEta: { etaId: 'eta-1', role: EtaRole.EMPLOYEE },
    };

    expect(guard.canActivate(createExecutionContext(request))).toBe(true);
  });

  it('allows owner even when owner is not listed explicitly', () => {
    const guard = buildGuard([EtaRole.ADMIN]);
    const request: RequestWithEtaContext = {
      headers: {},
      currentEta: { etaId: 'eta-1', role: EtaRole.OWNER },
    };

    expect(guard.canActivate(createExecutionContext(request))).toBe(true);
  });

  it('rejects roles outside metadata', () => {
    const guard = buildGuard([EtaRole.ADMIN]);
    const request: RequestWithEtaContext = {
      headers: {},
      currentEta: { etaId: 'eta-1', role: EtaRole.EMPLOYEE },
    };

    expect(() => guard.canActivate(createExecutionContext(request))).toThrow(
      ForbiddenException,
    );
  });
});
