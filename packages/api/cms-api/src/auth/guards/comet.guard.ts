import { CanActivate, ExecutionContext, HttpException, Injectable, mixin } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard, IAuthGuard, Type } from "@nestjs/passport";
import { Request } from "express";
import { isObservable, lastValueFrom } from "rxjs";

import { CurrentUserInterface } from "../current-user/current-user";
import { allowForRoleMetadataKey } from "../decorators/allow-for-role.decorator";

export function createCometAuthGuard(type?: string | string[]): Type<IAuthGuard> {
    @Injectable()
    class CometAuthGuard extends AuthGuard(type) implements CanActivate {
        constructor(private reflector: Reflector) {
            super();
        }

        getRequest(context: ExecutionContext): Request {
            return context.getType().toString() === "graphql"
                ? GqlExecutionContext.create(context).getContext().req
                : context.switchToHttp().getRequest();
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        handleRequest<CurrentUserInterface>(err: unknown, user: any): CurrentUserInterface {
            if (err) {
                throw err;
            }
            if (user) {
                return user;
            }
            throw new HttpException("UserNotAuthenticated", 200);
        }

        async canActivate(context: ExecutionContext): Promise<boolean> {
            if (this.reflector.getAllAndOverride("disableGlobalGuard", [context.getHandler(), context.getClass()])) {
                return true;
            }

            const isPublicApi = this.reflector.getAllAndOverride("publicApi", [context.getHandler(), context.getClass()]);
            const includeInvisibleContent = !!this.getRequest(context).headers["x-include-invisible-content"];

            if (isPublicApi && !includeInvisibleContent) {
                return true;
            }

            const canActivate = await super.canActivate(context);
            const isAllowed = isObservable(canActivate) ? await lastValueFrom(canActivate) : canActivate;

            const roles = this.reflector.getAllAndOverride<string[]>(allowForRoleMetadataKey, [context.getHandler(), context.getClass()]) ?? [];
            if (isAllowed && roles.length > 0) {
                const userRole = ((this.getRequest(context).user as CurrentUserInterface) || undefined)?.role;
                if (!userRole) return false;

                const userRoleIsAllowed = roles.some((role) => role.toLowerCase() === userRole.toLowerCase());
                return userRoleIsAllowed;
            }

            return isAllowed;
        }
    }
    return mixin(CometAuthGuard);
}
