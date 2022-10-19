export interface UserNotificationsHistory {
    id: string;
    userId: string;
    subject: string;
    message: string;
    sendDate: Date;
    isWatched: boolean;
}
