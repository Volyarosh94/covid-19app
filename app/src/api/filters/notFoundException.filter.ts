import { ArgumentsHost, Catch, ExceptionFilter, HttpException, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { DeskNotFoundException } from "../../desk-service/exceptions/deskNotFoundException";
import { FloorNotFoundException } from "../../location-service/exceptions/floorNotFoundException";
import { LocationNotFoundException } from "../../location-service/exceptions/locationNotFoundException";
import { UserNotFountException } from "../../user-service/exceptions/userNotFountException";
import { DeskNotFoundHttpException } from "../exceptions/deskNotFoundHttpException";
import { ExtendedError } from "../exceptions/errors/error";
import { FloorNotFoundHttpException } from "../exceptions/floorNotFoundHttpException";
import { LocationNotFoundHttpException } from "../exceptions/locationNotFoundHttpException";
import { UserNotFoundHttpException } from "../exceptions/userNotFoundHttpException";

@Catch(LocationNotFoundException, FloorNotFoundException, DeskNotFoundException, UserNotFountException)
export class NotFoundExceptionFilter implements ExceptionFilter {
    catch(exception: ExtendedError, host: ArgumentsHost) {
        const response: Response = host.switchToHttp().getResponse();
        let httpException: HttpException;

        if (exception instanceof LocationNotFoundException) {
            httpException = new LocationNotFoundHttpException(exception.locationId);
        } else if (exception instanceof FloorNotFoundException) {
            httpException = new FloorNotFoundHttpException(exception.floorId);
        } else if (exception instanceof DeskNotFoundException) {
            httpException = new DeskNotFoundHttpException(exception.deskId);
        } else if (exception instanceof UserNotFountException) {
            httpException = new UserNotFoundHttpException(exception.userId);
        } else {
            httpException = new NotFoundException(exception.message);
        }

        const status = httpException.getStatus();
        const httpResponse = httpException.getResponse();

        return response.status(httpException.getStatus()).json({
            result: null,
            error: {
                statusCode: status,
                name: httpResponse["error"] as string,
                message: httpResponse["message"] as string
            }
        });
    }
}
