import { Body, Controller, HttpStatus, Inject, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { INotificationService } from "../../notification-service/INotificationService";
import { NOTIFICATION_SERVICE } from "../../notification-service/ioc";
import { PushNotificationBody } from "../dto/pushNotificationBody.dto";
import { EmailNotificationBody } from "../dto/emailNotificationBody.dto";

@ApiTags("Notification")
@Controller("notifications")
export class NotificationController {
    constructor(
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: INotificationService
    ) {}

    @Post("/notification-push")
    @ApiOperation({ summary: "Send push notification" })
    @ApiOkResponse({ status: HttpStatus.OK })
    async sendPushNotification(@Body() body: PushNotificationBody): Promise<void> {
        await this.notificationService.sendPushNotification(body);
    }

    @Post("/notification-email")
    @ApiOperation({ summary: "Send email notification" })
    @ApiOkResponse({ status: HttpStatus.OK })
    async sendEmailNotification(@Body() body: EmailNotificationBody): Promise<void> {
        await this.notificationService.sendEmailNotification(body);
    }
}
