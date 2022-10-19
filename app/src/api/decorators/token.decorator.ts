import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const AccessToken = createParamDecorator((_, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.headers["authorization"].split(" ")[1];
});
