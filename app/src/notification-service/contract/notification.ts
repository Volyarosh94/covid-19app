import { NotificationRecipientType } from "./notificationRecipientType";
import { NOTIFICATION_STATUS_TYPE } from "./notificationStatusType";

export interface Notification {
    id: string;
    subject: string;
    message: string;
    sendDate: Date;
    locationId: string;
    status: NOTIFICATION_STATUS_TYPE;
    recipients: NotificationRecipientType;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
}
