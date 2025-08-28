import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '@finpay360/shared-types';

export const CurrentUser = createParamDecorator(
  (data: keyof IUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as IUser;
    return data ? user?.[data] : user;
  },
);
