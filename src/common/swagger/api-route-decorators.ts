import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from './api-error-response.dto';

type ApiRouteErrorsOptions = {
  auth?: boolean;
  badRequest?: string | false;
  conflict?: string;
  forbidden?: string;
  notFound?: string;
  unauthorized?: string;
};

export function ApiEtaContext() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiHeader({
      name: 'x-current-eta-id',
      required: false,
      description:
        'Optional ETA identifier. When omitted, the active ETA from the token is used.',
    }),
  );
}

export function ApiRouteErrors(options: ApiRouteErrorsOptions = {}) {
  const decorators = [];

  if (options.badRequest !== false) {
    decorators.push(
      ApiBadRequestResponse({
        type: ApiErrorResponseDto,
        description:
          options.badRequest ?? 'Invalid request payload or parameters.',
      }),
    );
  }

  if (options.auth || options.unauthorized) {
    decorators.push(
      ApiUnauthorizedResponse({
        type: ApiErrorResponseDto,
        description:
          options.unauthorized ?? 'Missing, expired or invalid bearer token.',
      }),
    );
  }

  if (options.auth || options.forbidden) {
    decorators.push(
      ApiForbiddenResponse({
        type: ApiErrorResponseDto,
        description:
          options.forbidden ??
          'Authenticated user is not allowed to access this resource.',
      }),
    );
  }

  if (options.notFound) {
    decorators.push(
      ApiNotFoundResponse({
        type: ApiErrorResponseDto,
        description: options.notFound,
      }),
    );
  }

  if (options.conflict) {
    decorators.push(
      ApiConflictResponse({
        type: ApiErrorResponseDto,
        description: options.conflict,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function ApiUuidParam(
  name = 'id',
  description = 'Resource identifier.',
) {
  return ApiParam({
    name,
    description,
    format: 'uuid',
    type: String,
  });
}
