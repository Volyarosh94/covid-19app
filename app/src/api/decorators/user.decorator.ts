import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const UserId = createParamDecorator((_, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.user["oid"];
});
