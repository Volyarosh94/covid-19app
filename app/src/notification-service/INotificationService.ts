import { BookingEmailParams } from "./contract/bookingEmailParams";
import { BookingConfirmationEmailParams } from "./contract/bookingConfirmationEmailParams";
import { DeskApproverConfirmationEmailParams } from "./contract/deskApproverConfirmationEmailParams";
import { NotificationCreateRequest } from "./contract/notificationCreateRequest";
import { NotificationPagination } from "./contract/notificationPagination";
import { NotificationQueryParams } from "./contract/notificationQueryParams";
import { NotificationSendRequest } from "./contract/notificationSendRequest";
import { NotificationUpdateRequest } from "./contract/notificationUpdateRequest";
import { UserNotificationsHistoryPagination } from "./contract/userNotificationsHistoryPagination";
import moment from "moment";
import { QuestionnarieNotificationEntity } from "./entity/questionnarie.notification.entity";
import { NotificationEntity } from "./entity/notification.entity";

export interface INotificationService {
    createNotification(body: NotificationCreateRequest): Promise<NotificationEntity>;
    getNotificationById(notificationId: string): Promise<NotificationEntity>;
    getNotifications(locationId: string, params?: NotificationQueryParams): Promise<NotificationPagination>;
    updateNotification(notificationId: string, body: NotificationUpdateRequest): Promise<NotificationEntity>;
    removeNotification(notificationId: string): Promise<string>;
    sendAdminNotification(notificationId: string, body: NotificationSendRequest): Promise<string>;
    sendQuestionnaireBasedCancelBookingNotification(bookingId: string): Promise<void>;
    sendQuestionnaireReminder(bookingId: string, remainedTime: number): Promise<void>;
    sendQuestionnaireStartNotification(bookingId: string): Promise<void>;
    getUserNotificationsHistory(
        userId: string,
        params?: NotificationQueryParams
    ): Promise<UserNotificationsHistoryPagination>;
    sendCancelBookingByAdminNotification(bookingId: string): Promise<void>;
    sendDeskApproverConfirmationEmail(params: DeskApproverConfirmationEmailParams): Promise<void>;
    sendBookingConfirmationEmail(params: BookingConfirmationEmailParams): Promise<void>;
    updateNotificationWatchStatus(notificationId: string): Promise<void>;
    sendBookingConfirmedEmail(params: BookingEmailParams): Promise<void>;
    sendBookingDeclinedEmail(params: BookingEmailParams): Promise<void>;
    createQuestionnaireNotifications(bookingId: string, locationId: string): Promise<void>;
    getQuestionnaireNotification(date: moment.Moment): Promise<QuestionnarieNotificationEntity[]>;
    getAdminNotificationsBySendDate(date: moment.Moment): Promise<NotificationEntity[]>;
    deleteQuestionnaireNotification(id: string): Promise<{ affected?: number }>;
}
