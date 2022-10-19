import { Inject, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as moment from "moment";
import { BOOKING_STATUS_TYPE } from "../booking-service/contract/bookingStatusType";
import { QuestionnaireNotificationType } from "../notification-service/contract/questionnaireNotificationType";
import { INotificationService } from "../notification-service/INotificationService";
import { NOTIFICATION_SERVICE } from "../notification-service/ioc";

import { ICronService } from "./ICronService";

@Injectable()
export class CronService implements ICronService {
    constructor(
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: INotificationService
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async SendQuestionnaireScheduledNotifications(): Promise<void> {
        const now = moment();
        const [adminNotifications, questionnaireNotifications] = await Promise.all([
            this.notificationService.getAdminNotificationsBySendDate(now),
            this.notificationService.getQuestionnaireNotification(now)
        ]);

        adminNotifications.forEach((notification) => {
            this.notificationService.sendAdminNotification(notification.id, {
                recipientType: notification.recipients,
                startDate: notification.startDate,
                endDate: notification.endDate
            });
        });

        questionnaireNotifications.forEach(async (job) => {
            const result = await this.notificationService.deleteQuestionnaireNotification(job.id);

            if (result.affected && job.booking.status !== BOOKING_STATUS_TYPE.CANCELED) {
                if (job.type === QuestionnaireNotificationType.QUESTIONNAIRE_START_NOTIFICATION) {
                    await this.notificationService.sendQuestionnaireStartNotification(job.bookingId);
                }
                if (
                    job.type === QuestionnaireNotificationType.QUESTIONNAIRE_REMINDER &&
                    job.booking.hasPassedQuestionnaire === null
                ) {
                    await this.notificationService.sendQuestionnaireReminder(job.bookingId, job.remainedTime);
                }
                if (
                    job.type === QuestionnaireNotificationType.QUESTIONNAIRE_CANCEL_BOOKING_NOTIFICATION &&
                    job.booking.hasPassedQuestionnaire === null
                ) {
                    await this.notificationService.sendQuestionnaireBasedCancelBookingNotification(job.bookingId);
                }
            }
        });
    }
}
