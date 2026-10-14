
import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import type { AuthenticatedRequest } from '../guards/jwt-auth.guard.js';

export const RequestedUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const user = request.user;

    if (!user) {
      Logger.error(
        `No authenticated user found [${request.method.toUpperCase()} ${request.path}]`,
        'RequestedUser',
      );

      throw new InternalServerErrorException(
        'Could not retrieve authenticated user',
      );
    }

    return user;
  },
);
