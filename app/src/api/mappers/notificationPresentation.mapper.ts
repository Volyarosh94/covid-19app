import { NotificationEntity } from "../../notification-service/entity/notification.entity";
import { UserNotificationsHistoryEntity } from "../../notification-service/entity/userNotificationsHistory.entity";
import { NotificationPresentation } from "../dto/notification/notificationPresentation.dto";
import { UsersNotificationsPresentation } from "../dto/notification/usersNotificationsPresentation.dto";

export class NotificationPresentationMapper {
    mapToNotificationPresentation(entity: NotificationEntity): NotificationPresentation {
        return {
            id: entity.id,
            subject: entity.subject,
            message: entity.message,
            status: entity.status,
            createdAt: entity.createdAt,
            recipients: entity.recipients,
            sendDate: entity.sendDate,
            startDate: entity.startDate,
            endDate: entity.endDate,
            locationId: entity.location.id
        };
    }

    mapToUserNotificationHistoryPresentation(entity: UserNotificationsHistoryEntity): UsersNotificationsPresentation {
        return {
            id: entity.id,
            subject: entity.subject,
            message: entity.message,
            sendDate: entity.sendDate,
            userId: entity.user.id,
            isWatched: entity.isWatched
        };
    }
}
