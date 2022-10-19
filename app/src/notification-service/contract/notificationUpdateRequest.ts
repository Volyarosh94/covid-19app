import { NotificationRecipientType } from "./notificationRecipientType";

export interface NotificationUpdateRequest {
    subject?: string;
    message?: string;
    sendDate?: Date;
    recipients?: NotificationRecipientType;
    startDate?: Date;
    endDate?: Date;
}
