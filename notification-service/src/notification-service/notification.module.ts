import { Module } from "@nestjs/common";
import * as sendgridMail from "@sendgrid/mail";
import { NOTIFICATION_SERVICE, SENDGRID_SERVICE } from "./ioc";
import { NotificationService } from "./notification.service";

@Module({
    providers: [
        {
            provide: NOTIFICATION_SERVICE,
            useClass: NotificationService
        },
        {
            provide: SENDGRID_SERVICE,
            useFactory: () => {
                return sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);
            }
        }
    ],

    exports: [
        {
            provide: NOTIFICATION_SERVICE,
            useClass: NotificationService
        }
    ]
})
export class NotificationModule {}
