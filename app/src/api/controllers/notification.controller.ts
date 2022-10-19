import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Inject,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ILocationService } from "../../location-service/ILocationService";
import { LOCATION_SERVICE } from "../../location-service/ioc";
import { INotificationService } from "../../notification-service/INotificationService";
import { NOTIFICATION_SERVICE } from "../../notification-service/ioc";
import { NotificationBody } from "../dto/notification/NotificationBody.dto";
import { NotificationCreateBody } from "../dto/notification/notificationCreateBody.dto";
import { NotificationFilterQuery } from "../dto/notification/notificationFilterQuery.dto";
import { NotificationIdPresentation } from "../dto/notification/notificationIdPresentation.dto";
import { NotificationPaginationPresentation } from "../dto/notification/notificationPaginationPresentation.dto";
import { NotificationPresentation } from "../dto/notification/notificationPresentation.dto";
import { NotificationUpdateBody } from "../dto/notification/notificationUpdateBody.dto";
import { UserNotificationsPaginationPresentation } from "../dto/notification/userNotificationsPagination.dto";
import { LocationNotFoundHttpException } from "../exceptions/locationNotFoundHttpException";
import { AzureADGuard } from "../guards/auth.guard";
import { NotificationPresentationMapper } from "../mappers/notificationPresentation.mapper";

@ApiTags("Notification")
@Controller()
@ApiBearerAuth()
@UseGuards(AzureADGuard)
export class NotificationController {
    constructor(
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: INotificationService,
        @Inject(LOCATION_SERVICE)
        private readonly locationService: ILocationService,
        private readonly mapper: NotificationPresentationMapper
    ) {}

    @Post("locations/:locationId/notifications")
    @ApiOperation({ summary: "Create notification" })
    @ApiOkResponse({ type: NotificationPresentation })
    async createNotification(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string,
        @Body() body: NotificationCreateBody
    ): Promise<NotificationPresentation> {
        const location = await this.locationService.getLocationById(locationId);

        if (!location) {
            throw new LocationNotFoundHttpException(locationId);
        }

        const entity = await this.notificationService.createNotification({ ...body, locationId });
        return this.mapper.mapToNotificationPresentation(entity);
    }

    @Get("locations/:locationId/notifications")
    @ApiOperation({ summary: "Get notifications" })
    @ApiOkResponse({ type: NotificationPaginationPresentation })
    async getNotifications(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string,
        @Query() query?: NotificationFilterQuery
    ): Promise<NotificationPaginationPresentation> {
        const location = await this.locationService.getLocationById(locationId);

        if (!location) {
            throw new LocationNotFoundHttpException(locationId);
        }

        const result = await this.notificationService.getNotifications(locationId, query);
        return {
            ...result,
            notifications: result.notifications.map(this.mapper.mapToNotificationPresentation)
        };
    }

    @Get(":notificationId/notifications")
    @ApiOperation({ summary: "Get notification" })
    @ApiOkResponse({ type: NotificationPresentation })
    async getNotification(
        @Param("notificationId", new ParseUUIDPipe({ version: "4" })) notificationId: string
    ): Promise<NotificationPresentation> {
        const entity = await this.notificationService.getNotificationById(notificationId);
        return entity ? this.mapper.mapToNotificationPresentation(entity) : null;
    }

    @Put(":notificationId/notifications")
    @ApiOperation({ summary: "Update notification" })
    @ApiOkResponse({ type: NotificationPresentation })
    async updateNotification(
        @Param("notificationId", new ParseUUIDPipe({ version: "4" })) notificationId: string,
        @Body() body: NotificationUpdateBody
    ): Promise<NotificationPresentation> {
        const notification = await this.notificationService.getNotificationById(notificationId);

        if (!notification) {
            throw new NotFoundException(`Notification ${notificationId} not found`);
        }

        const entity = await this.notificationService.updateNotification(notificationId, body);
        return this.mapper.mapToNotificationPresentation(entity);
    }

    @Delete(":notificationId/notifications")
    @ApiOperation({ summary: "Delete notification" })
    @ApiOkResponse({ status: HttpStatus.OK, type: NotificationIdPresentation })
    async deleteNotification(
        @Param("notificationId", new ParseUUIDPipe({ version: "4" })) notificationId: string
    ): Promise<NotificationIdPresentation> {
        const id = await this.notificationService.removeNotification(notificationId);
        return { id };
    }

    @Post(":notificationId/send-notification")
    @ApiOperation({ summary: "Send admin notification" })
    @ApiOkResponse({ status: HttpStatus.OK })
    async sendNotification(
        @Param("notificationId", new ParseUUIDPipe({ version: "4" })) notificationId: string,
        @Body() body: NotificationBody
    ): Promise<{ id: string }> {
        const id = await this.notificationService.sendAdminNotification(notificationId, body);
        return { id };
    }

    @Get("/users/:userId/notifications-history")
    @ApiOperation({ summary: "Get history of user's notifications" })
    @ApiOkResponse({ status: HttpStatus.OK, type: UserNotificationsPaginationPresentation })
    async getUserNotificationsHistory(
        @Param("userId", new ParseUUIDPipe({ version: "4" })) userId: string,
        @Query() query?: NotificationFilterQuery
    ): Promise<UserNotificationsPaginationPresentation> {
        const result = await this.notificationService.getUserNotificationsHistory(userId, query);
        return {
            ...result,
            notifications: result.notifications.map(this.mapper.mapToUserNotificationHistoryPresentation)
        };
    }

    @Delete("/notifications-history/:notificationId")
    @ApiOperation({ summary: "Update notification watch status" })
    @ApiOkResponse({ status: HttpStatus.OK })
    async updateNotificationWatchStatus(
        @Param("notificationId", new ParseUUIDPipe({ version: "4" })) notificationId: string
    ): Promise<void> {
        return this.notificationService.updateNotificationWatchStatus(notificationId);
    }
}
