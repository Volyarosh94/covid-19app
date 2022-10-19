import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    ForbiddenException,
    HttpException,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException
} from "@nestjs/common";
import { Response } from "express";

@Catch(UnauthorizedException, BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException)
export class ErrorResponseExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const response: Response = host.switchToHttp().getResponse();

        return response.status(exception.getStatus()).json({
            result: null,
            error: {
                statusCode: exception.getStatus(),
                name: exception["response"] ? (exception["response"]["error"] as string) : exception.name,
                message: exception["response"] ? (exception["response"]["message"] as string) : exception.message
            }
        });
    }
}
