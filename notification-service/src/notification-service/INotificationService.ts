import { PushNotificationSendRequest } from "./contract/pushNotificationSendRequest";
import { EmailNotificationSendRequest } from "./contract/emailNotificationSendRequest";


export interface INotificationService {
    sendEmailNotification(body: EmailNotificationSendRequest): Promise<void>;
    sendPushNotification(body: PushNotificationSendRequest): Promise<void>;
}
