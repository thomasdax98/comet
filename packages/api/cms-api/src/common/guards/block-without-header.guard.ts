import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Request } from "express";

@Injectable()
export class BlockWithoutHeaderGuard implements CanActivate {
    private headerName: string;
    private headerValue: string;

    constructor({ headerName, headerValue }: { headerName: string; headerValue: string }) {
        this.headerName = headerName;
        this.headerValue = headerValue;
    }

    getRequest(context: ExecutionContext): Request {
        return context.getType().toString() === "graphql"
            ? GqlExecutionContext.create(context).getContext().req
            : context.switchToHttp().getRequest();
    }

    canActivate(context: ExecutionContext): boolean {
        const request = this.getRequest(context);
        return request.header(this.headerName) === this.headerValue;
    }
}
