import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import type { EtaContext } from '../interfaces/eta-context.interface';
import type { RequestWithEtaContext } from '../interfaces/request-with-eta-context.interface';

export const CurrentEta = createParamDecorator(
  (_data: unknown, context: ExecutionContext): EtaContext => {
    const request = context.switchToHttp().getRequest<RequestWithEtaContext>();

    if (!request.currentEta) {
      throw new InternalServerErrorException('ETA context was not resolved.');
    }

    return request.currentEta;
  },
);
