import { AuthenticationError } from 'apollo-server-core';
import { MiddlewareFn } from 'type-graphql';
import Context from '../types/Context';

export const checkAuth: MiddlewareFn<Context> = async ({ context }, next) => {
  const { req } = context;
  if (!req.session.userId) {
    throw new AuthenticationError('Not authenticated to perform Graphql operations');
  }

  await next();
};
