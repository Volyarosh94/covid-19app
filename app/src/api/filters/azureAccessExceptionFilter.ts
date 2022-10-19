import { ArgumentsHost, InternalServerErrorException, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from "express";
import { AzureADAccessException } from "../exceptions/azureAdAccessException";
import { MsGraphAccessError } from "../../user-service/exceptions/msGraphAccessError";
import { ExtendedError } from "../exceptions/errors/error";

@Catch(AzureADAccessException, MsGraphAccessError)
export class AzureAccessExceptionFilter implements ExceptionFilter {
    catch(exception: ExtendedError | HttpException, host: ArgumentsHost) {
        const response: Response = host.switchToHttp().getResponse();
        let httpException: HttpException;

        if (exception instanceof AzureADAccessException) {
            httpException = new InternalServerErrorException(exception.message);
        } else if (exception instanceof MsGraphAccessError) {
            httpException = new InternalServerErrorException(exception.message);
        } else {
            httpException = new InternalServerErrorException(exception.message);
        }

        return response.status(httpException.getStatus()).json({
            result: null,
            error: {
                statusCode: httpException.getStatus(),
                name: httpException.name,
                message: httpException.message
            }
        });
    }
}
