import { INotificationService } from "../notification-service/INotificationService";

export const mockNotificationService = (): INotificationService => ({
    createNotification: jest.fn(),
    getNotificationById: jest.fn(),
    getNotifications: jest.fn(),
    updateNotification: jest.fn(),
    getUserNotificationsHistory: jest.fn(),
    removeNotification: jest.fn(),
    sendAdminNotification: jest.fn(),
    sendQuestionnaireBasedCancelBookingNotification: jest.fn(),
    sendQuestionnaireReminder: jest.fn(),
    sendQuestionnaireStartNotification: jest.fn(),
    sendCancelBookingByAdminNotification: jest.fn(),
    sendDeskApproverConfirmationEmail: jest.fn(),
    sendBookingConfirmationEmail: jest.fn(),
    updateNotificationWatchStatus: jest.fn(),
    sendBookingConfirmedEmail: jest.fn(),
    sendBookingDeclinedEmail: jest.fn(),
    createQuestionnaireNotifications: jest.fn(),
    getQuestionnaireNotification: jest.fn(),
    getAdminNotificationsBySendDate: jest.fn(),
    deleteQuestionnaireNotification: jest.fn()
});
