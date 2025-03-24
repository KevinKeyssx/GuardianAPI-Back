import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { User } from '@user/entities/user.entity';

export const hideUserMiddleware: FieldMiddleware = async (
    ctx: MiddlewareContext,
    next: NextFn
) => {
    const user = ctx.context.req.user as User;

    return user.apiUser ? null : next();
};