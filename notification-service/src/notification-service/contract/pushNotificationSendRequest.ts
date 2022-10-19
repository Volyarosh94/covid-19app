export interface PushNotificationSendRequest {
    notificationSubject: string;
    notificationText: string;
    deviceToken:string[];
    locationId?: string;
    bookingId?: string;
}
