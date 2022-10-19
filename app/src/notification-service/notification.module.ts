import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingModule } from "../booking-service/booking.module";
import { LocationModule } from "../location-service/location.module";
import { UserModule } from "../user-service/user.module";
import { NotificationEntity } from "./entity/notification.entity";
import { NOTIFICATION_SERVICE } from "./ioc";
import { NotificationMapper } from "./notification.mapper";
import { NotificationService } from "./notification.service";
import { NotificationServiceConfig } from "./notificationServiceConfig";

import { UserNotificationsHistoryEntity } from "./entity/userNotificationsHistory.entity";
import { QuestionnarieNotificationEntity } from "./entity/questionnarie.notification.entity";
import { CovidQuestionModule } from "../covid-question-service/covid.question.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([NotificationEntity, UserNotificationsHistoryEntity, QuestionnarieNotificationEntity]),
        forwardRef(() => BookingModule),
        UserModule,
        LocationModule,
        CovidQuestionModule
    ],
    providers: [
        {
            provide: NOTIFICATION_SERVICE,
            useClass: NotificationService
        },
        {
            provide: NotificationServiceConfig,
            useFactory: () => {
                return {
                    baseUrl: process.env.NOTIFICATION_SERVICE_URL
                };
            }
        },
        NotificationMapper
    ],
    exports: [
        {
            provide: NOTIFICATION_SERVICE,
            useClass: NotificationService
        }
    ]
})
export class NotificationModule {}
