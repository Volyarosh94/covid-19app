import { NotificationEntity } from "../entity/notification.entity";

export interface NotificationPagination {
    page: number;
    limit: number;
    totalPages: number;
    notifications: NotificationEntity[];
}
