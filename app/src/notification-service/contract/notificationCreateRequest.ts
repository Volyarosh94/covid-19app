import { NotificationRecipientType } from "./notificationRecipientType";

export interface NotificationCreateRequest {
    subject: string;
    message: string;
    sendDate?: Date;
    locationId: string;
    recipients: NotificationRecipientType;
    startDate?: Date;
    endDate?: Date;
}
