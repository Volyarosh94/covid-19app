import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Response } from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface CommonResponse<T> {
    result: {
        statusCode: number;
        data: T;
    };
    error: null;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<CommonResponse<T>> {
    intercept(ctx: ExecutionContext, next: CallHandler): Observable<CommonResponse<T>> {
        return next.handle().pipe(
            map((data: T) => {
                return {
                    result: {
                        statusCode: ctx.switchToHttp().getResponse<Response>().statusCode,
                        data
                    },
                    error: null
                };
            })
        );
    }
}
