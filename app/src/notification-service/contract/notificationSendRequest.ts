import { NotificationRecipientType } from "./notificationRecipientType";

export interface NotificationSendRequest {
    recipientType: NotificationRecipientType;
    startDate?: Date;
    endDate?: Date;
}
