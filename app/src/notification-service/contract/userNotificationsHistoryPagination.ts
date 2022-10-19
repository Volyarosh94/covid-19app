import { UserNotificationsHistoryEntity } from "../entity/userNotificationsHistory.entity";

export interface UserNotificationsHistoryPagination {
    page: number;
    limit: number;
    totalPages: number;
    notifications: UserNotificationsHistoryEntity[];
}
