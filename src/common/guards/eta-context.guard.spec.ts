import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { EtaRole } from '../enums/eta-role.enum';
import type { RequestWithEtaContext } from '../interfaces/request-with-eta-context.interface';
import { EtaContextGuard } from './eta-context.guard';

function createExecutionContext(
  request: RequestWithEtaContext,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('EtaContextGuard', () => {
  const guard = new EtaContextGuard();

  it('uses x-current-eta-id when it matches a membership', () => {
    const request: RequestWithEtaContext = {
      headers: { 'x-current-eta-id': 'eta-2' },
      user: {
        userId: 'user-1',
        email: 'admin@eta.local',
        activeEtaId: 'eta-1',
        memberships: [
          { etaId: 'eta-1', role: EtaRole.EMPLOYEE },
          { etaId: 'eta-2', role: EtaRole.ADMIN },
        ],
      },
    };

    expect(guard.canActivate(createExecutionContext(request))).toBe(true);
    expect(request.currentEta).toEqual({
      etaId: 'eta-2',
      role: EtaRole.ADMIN,
    });
  });

  it('falls back to active ETA when no header is provided', () => {
    const request: RequestWithEtaContext = {
      headers: {},
      user: {
        userId: 'user-1',
        email: 'employee@eta.local',
        activeEtaId: 'eta-1',
        memberships: [{ etaId: 'eta-1', role: EtaRole.EMPLOYEE }],
      },
    };

    expect(guard.canActivate(createExecutionContext(request))).toBe(true);
    expect(request.currentEta).toEqual({
      etaId: 'eta-1',
      role: EtaRole.EMPLOYEE,
    });
  });

  it('rejects a requested ETA outside user memberships', () => {
    const request: RequestWithEtaContext = {
      headers: { 'x-current-eta-id': 'eta-2' },
      user: {
        userId: 'user-1',
        email: 'employee@eta.local',
        activeEtaId: 'eta-1',
        memberships: [{ etaId: 'eta-1', role: EtaRole.EMPLOYEE }],
      },
    };

    expect(() => guard.canActivate(createExecutionContext(request))).toThrow(
      ForbiddenException,
    );
  });
});
