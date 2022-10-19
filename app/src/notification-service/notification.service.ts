/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import axios, { AxiosInstance } from "axios";
import * as _ from "lodash";
import * as moment from "moment";
import { Repository } from "typeorm";
import { BookingService } from "../booking-service/booking.service";
import { BookingEntity } from "../booking-service/entity/booking.entity";
import { IBookingService } from "../booking-service/IBookingService";
import { ICovidQuestionService } from "../covid-question-service/ICovidQuestionService";
import { COVID_QUESTION_SERVICE } from "../covid-question-service/ioc";
import { ILocationService } from "../location-service/ILocationService";
import { LOCATION_SERVICE } from "../location-service/ioc";
import { USER_SERVICE } from "../user-service/ioc";
import { IUserService } from "../user-service/IUserService";
import { convertLocationTimeZoneDateTime } from "../utils/util";
import { BookingConfirmationEmailParams } from "./contract/bookingConfirmationEmailParams";
import { BookingEmailParams } from "./contract/bookingEmailParams";
import { DeskApproverConfirmationEmailParams } from "./contract/deskApproverConfirmationEmailParams";
import { NotificationCreateRequest } from "./contract/notificationCreateRequest";
import { NotificationPagination } from "./contract/notificationPagination";
import { NotificationQueryParams } from "./contract/notificationQueryParams";
import { NotificationRecipientType } from "./contract/notificationRecipientType";
import { NotificationSendRequest } from "./contract/notificationSendRequest";
import { NOTIFICATION_STATUS_TYPE } from "./contract/notificationStatusType";
import { NotificationUpdateRequest } from "./contract/notificationUpdateRequest";
import { QuestionnaireNotificationType } from "./contract/questionnaireNotificationType";
import { UserNotificationsHistoryPagination } from "./contract/userNotificationsHistoryPagination";
import { NotificationEntity } from "./entity/notification.entity";
import { QuestionnarieNotificationEntity } from "./entity/questionnarie.notification.entity";
import { UserNotificationsHistoryEntity } from "./entity/userNotificationsHistory.entity";
import { INotificationService } from "./INotificationService";
import { NotificationMapper } from "./notification.mapper";
import { NotificationServiceConfig } from "./notificationServiceConfig";
import { sendBookingConfirmationEmailTemplate } from "./templates/sendBookingConfirmationEmailTemplate";
import { sendBookingConfirmedEmailTemplate } from "./templates/sendBookingConfirmedEmailTemplate";
import { sendBookingDeclinedEmailTemplate } from "./templates/sendBookingDeclinedEmailTemplate";
import { sendDeskApproverConfirmationEmailTemplate } from "./templates/sendDeskApproverConfirmationEmailTemplate";

@Injectable()
export class NotificationService implements INotificationService {
    constructor(
        @InjectRepository(NotificationEntity)
        private readonly notificationRepository: Repository<NotificationEntity>,
        @InjectRepository(UserNotificationsHistoryEntity)
        private readonly userNotificationsHistoryRepository: Repository<UserNotificationsHistoryEntity>,
        @Inject(forwardRef(() => BookingService))
        private readonly bookingService: IBookingService,
        @Inject(USER_SERVICE)
        private readonly userService: IUserService,
        private readonly notificationServiceConfig: NotificationServiceConfig,
        private readonly mapper: NotificationMapper,
        @Inject(LOCATION_SERVICE)
        private readonly locationService: ILocationService,
        @InjectRepository(QuestionnarieNotificationEntity)
        private readonly questionnaireNotificationRepository: Repository<QuestionnarieNotificationEntity>,
        @Inject(COVID_QUESTION_SERVICE)
        private readonly covidQuestionService: ICovidQuestionService
    ) {}
    //TODO: implement error logging

    async createNotification(body: NotificationCreateRequest): Promise<NotificationEntity> {
        const location = await this.locationService.getLocationById(body.locationId);
        let timeToExecuteInLocationTimeZone: string | null = null;

        if (body.sendDate) {
            const format = "YYYY-MM-DD HH:mm:ssZ";
            timeToExecuteInLocationTimeZone = convertLocationTimeZoneDateTime(location.timezone, body.sendDate).format(
                format
            );
        }

        return this.notificationRepository.save(
            this.notificationRepository.create({
                ..._.omit(body, "locationId"),
                status: NOTIFICATION_STATUS_TYPE.PENDING,
                createdAt: new Date(),
                timeToExecuteInLocationTimeZone,
                location
            })
        );
    }

    async getNotifications(locationId: string, params?: NotificationQueryParams): Promise<NotificationPagination> {
        const limit = 10;
        const page = params && params.page ? params.page : 1;
        const skip = (page - 1) * limit;

        const [notifications, count] = await this.notificationRepository.findAndCount({
            where: { location: locationId },
            relations: ["location"],
            skip,
            take: limit,
            order: {
                createdAt: "DESC"
            }
        });

        return {
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            notifications
        };
    }

    async getNotificationById(notificationId: string): Promise<NotificationEntity> {
        const entity = await this.notificationRepository.findOne(notificationId, { relations: ["location"] });
        return entity ? entity : null;
    }

    async updateNotification(notificationId: string, body: NotificationUpdateRequest): Promise<NotificationEntity> {
        const notification = await this.notificationRepository.findOne(notificationId);

        if (!notification) {
            return null;
        }

        await this.notificationRepository.save({
            id: notificationId,
            ...body,
            status: NOTIFICATION_STATUS_TYPE.PENDING
        });
        return this.getNotificationById(notificationId);
    }

    async removeNotification(notificationId: string): Promise<string> {
        await this.notificationRepository.delete(notificationId);
        return notificationId;
    }

    async sendAdminNotification(notificationId: string, body: NotificationSendRequest): Promise<string> {
        const notification = await this.notificationRepository.findOne(notificationId, { relations: ["location"] });
        let bookingUserIds: string[];

        if (!notification) {
            return null;
        }

        if (body.recipientType === NotificationRecipientType.ALL) {
            bookingUserIds = await this.bookingService.getBookingUserIdsByLocationId(notification.location.id);
        } else if (body.recipientType === NotificationRecipientType.HAS_BOOKING) {
            bookingUserIds = await this.bookingService.getBookingUserIdsByDateRange(
                notification.location.id,
                body.startDate,
                body.endDate
            );
        }

        const users = await this.userService.getUsersByIds(bookingUserIds);

        if (!users.length) {
            throw new NotFoundException(`Recipients not found on location ${notification.location.locationName}`);
        }

        const emails = users.map((user) => user.email);
        const deviceToken = _.flatten(users.map((user) => user.deviceTokens));
        const sendDate = new Date();
        const isWatched = false;

        try {
            const client = this.getNotificationServiceClient();

            await Promise.all([
                client.post("/api/notifications/notification-email", {
                    notificationSubject: notification.subject,
                    notificationText: notification.message,
                    recipients: emails
                }),
                deviceToken.length
                    ? client.post("/api/notifications/notification-push", {
                        notificationSubject: notification.subject,
                        notificationText: notification.message,
                        deviceToken: deviceToken
                    })
                    : null,
                this.notificationRepository.save({ ...notification, status: NOTIFICATION_STATUS_TYPE.SENT }),
                users.map((user) => {
                    this.userNotificationsHistoryRepository.save(
                        this.mapper.mapToUserNotificationHistoryEntity(user, notification, sendDate, isWatched)
                    );
                })
            ]);
            return notification.id;
        } catch (err) {
            throw err;
        }
    }

    async getUserNotificationsHistory(
        userId: string,
        params?: NotificationQueryParams
    ): Promise<UserNotificationsHistoryPagination> {
        const limit = 10;
        const page = params && params.page ? params.page : 1;
        const skip = (page - 1) * limit;

        const [notifications, count] = await this.userNotificationsHistoryRepository.findAndCount({
            where: { user: userId },
            relations: ["user"],
            skip,
            take: limit,
            order: {
                sendDate: "DESC"
            }
        });

        return {
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            notifications
        };
    }

    async updateNotificationWatchStatus(notificationId: string): Promise<void> {
        const notification = await this.userNotificationsHistoryRepository.findOne(notificationId);
        if (!notification) {
            return null;
        }
        await this.userNotificationsHistoryRepository.save({ ...notification, isWatched: true });
    }

    async sendQuestionnaireBasedCancelBookingNotification(bookingId: string): Promise<void> {
        const booking = await this.bookingService.getBookingById(bookingId);
        const user = await this.userService.getUserById(booking.user.id);
        const location = booking.location.locationName;
        const notificationSubject = "Booking cancel notification";
        const notificationText = `Dear ${user.name}, your booking for ${location}, ${booking.desk.name} on ${moment(
            booking.dateFrom
        ).format("YYYY-MM-DD")} ${booking.timeFrom} was canceled. `;

        try {
            const client = this.getNotificationServiceClient();
            await Promise.all([
                user.deviceTokens.length
                    ? client.post("/api/notifications/notification-push", {
                        notificationSubject,
                        notificationText,
                        deviceToken: user.deviceTokens
                    })
                    : null,
                client.post("/api/notifications/notification-email", {
                    notificationSubject,
                    notificationText,
                    recipients: [user.email]
                }),
                this.bookingService.cancelBooking(bookingId)
            ]);
        } catch (err) {
            throw err;
        }
    }

    async sendQuestionnaireReminder(bookingId: string, remainedTime: number): Promise<void> {
        const booking = await this.bookingService.getBookingById(bookingId);
        const user = await this.userService.getUserById(booking.user.id);
        const location = booking.location.locationName;
        const basedCancellation = await this.covidQuestionService.getCovidQuestionnaireScheduleConfig(booking.location.id);
        const notificationSubject = "Questionnaire remained time notification";
        const notificationText = `Dear ${
            user.name
        }, please hurry up and take a questionnaire to confirm your booking ${location}, ${
            booking.desk.name
        } on ${moment(booking.dateFrom).format("YYYY-MM-DD")} ${
            booking.timeFrom
        }. Your booking will be canceled in ${remainedTime - basedCancellation.cancellationTime} minutes.
        <br><br>
        <a href="${process.env.WEBSITES_HOST}" target="_blank">Here's the link to questionnaire</a>`;

        try {
            const client = this.getNotificationServiceClient();
            await Promise.all([
                user.deviceTokens.length
                    ? client.post("/api/notifications/notification-push", {
                        notificationSubject,
                        notificationText,
                        deviceToken: user.deviceTokens
                    })
                    : null,
                client.post("/api/notifications/notification-email", {
                    notificationSubject,
                    notificationText,
                    recipients: [user.email]
                })
            ]);
        } catch (err) {
            throw err;
        }
    }

    async sendQuestionnaireStartNotification(bookingId: string): Promise<void> {
        const booking = await this.bookingService.getBookingById(bookingId);
        const user = await this.userService.getUserById(booking.user.id);
        const location = booking.location.locationName;
        const notificationSubject = "Questionnaire start notification";
        const notificationText = `Dear ${user.name}, please take a questionnaire to confirm your booking ${location}, ${
            booking.desk.name
        } on ${moment(booking.dateFrom).format("YYYY-MM-DD")} ${
            booking.timeFrom
        }. In case if you are not complete the questionnaire your booking will be canceled.
        <br><br>
        <a href="${process.env.WEBSITES_HOST}" target="_blank">Here's the link to questionnaire</a>`;

        try {
            const client = this.getNotificationServiceClient();
            await Promise.all([
                user.deviceTokens.length
                    ? client.post("/api/notifications/notification-push", {
                        notificationSubject,
                        notificationText,
                        deviceToken: user.deviceTokens,
                        locationId: booking.location.id,
                        bookingId: booking.id
                    })
                    : null,
                client.post("/api/notifications/notification-email", {
                    notificationSubject,
                    notificationText,
                    recipients: [user.email]
                })
            ]);
        } catch (err) {
            throw err;
        }
    }

    async sendCancelBookingByAdminNotification(bookingId: string): Promise<void> {
        const booking = await this.bookingService.getBookingById(bookingId);
        const user = await this.userService.getUserById(booking.user.id);
        const location = booking.location.locationName;
        const notificationSubject = "Booking cancelled notification";
        const notificationText = `Dear ${user.name}, your booking ${location}, ${booking.desk.name}, ${booking.dateFrom} was canceled by admin.`;
        try {
            const client = this.getNotificationServiceClient();
            await Promise.all([
                user.deviceTokens.length
                    ? client.post("/api/notifications/notification-push", {
                        notificationSubject,
                        notificationText,
                        deviceToken: user.deviceTokens
                    })
                    : null,
                client.post("/api/notifications/notification-email", {
                    notificationSubject,
                    notificationText,
                    recipients: [user.email]
                })
            ]);
        } catch (err) {
            throw err;
        }
    }

    async sendDeskApproverConfirmationEmail({
        desk,
        email,
        token
    }: DeskApproverConfirmationEmailParams): Promise<void> {
        try {
            const client = this.getNotificationServiceClient();
            await client.post("/api/notifications/notification-email", {
                notificationSubject: "Desk approver conformation",
                notificationText: sendDeskApproverConfirmationEmailTemplate({
                    desk,
                    email,
                    token
                }),
                recipients: [email]
            });
        } catch (err) {
            throw err;
        }
    }

    async sendBookingConfirmationEmail({
        booking,
        email,
        denyToken,
        approveToken
    }: BookingConfirmationEmailParams): Promise<void> {
        try {
            const client = this.getNotificationServiceClient();
            await client.post("/api/notifications/notification-email", {
                notificationSubject: "Approval required",
                notificationText: sendBookingConfirmationEmailTemplate(
                    {
                        booking,
                        email,
                        denyToken,
                        approveToken
                    },
                    this.formatBookingDate
                ),
                recipients: [email]
            });
        } catch (err) {
            throw err;
        }
    }

    async sendBookingConfirmedEmail({ booking }: BookingEmailParams): Promise<void> {
        try {
            const client = this.getNotificationServiceClient();
            await client.post("/api/notifications/notification-email", {
                notificationSubject: "Booking confirmed",
                notificationText: sendBookingConfirmedEmailTemplate({ booking }, this.formatBookingDate),
                recipients: [booking.user.email]
            });
        } catch (err) {
            throw err;
        }
    }

    async sendBookingDeclinedEmail({ booking }: BookingEmailParams): Promise<void> {
        try {
            const client = this.getNotificationServiceClient();
            await client.post("/api/notifications/notification-email", {
                notificationSubject: "Booking declined",
                notificationText: sendBookingDeclinedEmailTemplate({ booking }, this.formatBookingDate),
                recipients: [booking.user.email]
            });
        } catch (err) {
            throw err;
        }
    }

    async createQuestionnaireNotifications(bookingId: string, locationId: string): Promise<void> {
        const [booking, questionnaireScheduleConfig, location] = await Promise.all([
            this.bookingService.getBookingById(bookingId),
            this.covidQuestionService.getCovidQuestionnaireScheduleConfig(locationId),
            this.locationService.getLocationById(locationId)
        ]);

        if (!questionnaireScheduleConfig || !questionnaireScheduleConfig.isActive) {
            return null;
        }

        const date = moment(booking.dateFrom).format("YYYY-MM-DD");
        const format = "YYYY-MM-DD HH:mm:ssZ";

        let dateStringStart = convertLocationTimeZoneDateTime(
            location.timezone,
            new Date(`${date} ${booking.timeFrom}`)
        )
            .subtract(questionnaireScheduleConfig.startTime, "hours")
            .format(format);

        let dateStringCancel = convertLocationTimeZoneDateTime(
            location.timezone,
            new Date(`${date} ${booking.timeFrom}`)
        )
            .subtract(questionnaireScheduleConfig.cancellationTime, "minutes")
            .format(format);

        let dateStringReminder = convertLocationTimeZoneDateTime(
            location.timezone,
            new Date(`${date} ${booking.timeFrom}`)
        )
            .subtract(questionnaireScheduleConfig.reminderTime, "minutes")
            .format(format);

        const data = [
            {
                timeToExecuteInLocationTimeZone: dateStringStart,
                type: QuestionnaireNotificationType.QUESTIONNAIRE_START_NOTIFICATION,
                bookingId
            },
            {
                timeToExecuteInLocationTimeZone: dateStringReminder,
                type: QuestionnaireNotificationType.QUESTIONNAIRE_REMINDER,
                bookingId,
                remainedTime: questionnaireScheduleConfig.reminderTime
            },
            {
                timeToExecuteInLocationTimeZone: dateStringCancel,
                type: QuestionnaireNotificationType.QUESTIONNAIRE_CANCEL_BOOKING_NOTIFICATION,
                bookingId
            }
        ];

        await this.questionnaireNotificationRepository.save(this.questionnaireNotificationRepository.create(data));
    }

    async getQuestionnaireNotification(date: moment.Moment): Promise<QuestionnarieNotificationEntity[]> {
         return this.questionnaireNotificationRepository.find({
            where: { timeToExecuteInLocationTimeZone: date.format("YYYY-MM-DD HH:mm") },
            relations: ["booking"]
        });
    }

    async getAdminNotificationsBySendDate(date: moment.Moment): Promise<NotificationEntity[]> {
        return this.notificationRepository.find({
            where: {
                timeToExecuteInLocationTimeZone: date.format("YYYY-MM-DD HH:mm"),
                status: NOTIFICATION_STATUS_TYPE.PENDING
            }
        });
    }

    async deleteQuestionnaireNotification(id: string): Promise<{ affected?: number }> {
        return this.questionnaireNotificationRepository.update(id, { isDeleted: true });
    }

    private getNotificationServiceClient(): AxiosInstance {
        return axios.create({
            baseURL: this.notificationServiceConfig.baseUrl
        });
    }

    private formatBookingDate(booking: BookingEntity): string {
        return `${moment(booking.dateFrom).format("MMM D")}, ${
            booking.timeFrom.length > 5 ? booking.timeFrom.substring(0, 5) : booking.timeFrom
        }-${booking.timeTo.length > 5 ? booking.timeTo.substring(0, 5) : booking.timeTo}`;
    }
}
