import { Injectable } from "@nestjs/common";
import * as uuid from "uuid";
import { UserEntity } from "../user-service/entity/user.entity";
import { NotificationEntity } from "./entity/notification.entity";
import { UserNotificationsHistoryEntity } from "./entity/userNotificationsHistory.entity";

@Injectable()
export class NotificationMapper {
    mapToUserNotificationHistoryEntity(
        user: UserEntity,
        notification: NotificationEntity,
        sendDate: Date,
        isWatched: boolean
    ): UserNotificationsHistoryEntity {
        return {
            id: uuid.v4(),
            message: notification.message,
            subject: notification.subject,
            sendDate,
            isWatched,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                location: user.location,
                mobilePhone: user.mobilePhone,
                deviceTokens: []
            }
        };
    }
}
