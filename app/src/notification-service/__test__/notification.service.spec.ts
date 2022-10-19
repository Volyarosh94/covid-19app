import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import axios from "axios";
import * as moment from "moment";
import * as uuid from "uuid";
import { BookingService } from "../../booking-service/booking.service";
import { BookingEntity } from "../../booking-service/entity/booking.entity";
import { IBookingService } from "../../booking-service/IBookingService";
import { ICovidQuestionService } from "../../covid-question-service/ICovidQuestionService";
import { COVID_QUESTION_SERVICE } from "../../covid-question-service/ioc";
import { ILocationService } from "../../location-service/ILocationService";
import { LOCATION_SERVICE } from "../../location-service/ioc";
import { mockBookingService } from "../../testing/booking/booking.service.mock";
import { mockCustomBooking, mockCustomBookingEntity } from "../../testing/booking/data/mockBookingData";
import { mockCovidQuestionService } from "../../testing/covid.question.service.mock";
import { createMockDeskEntity } from "../../testing/desk/data/mock.desk.data";
import { createMockLocation } from "../../testing/location/data/mockLocationData";
import { mockLocationService } from "../../testing/location/location.service.mock";
import { IMockRepository, mockRepository } from "../../testing/repository.mock";
import { mockUserEntity } from "../../testing/user/data/mockUserData";
import { mockUserService } from "../../testing/user/user.service.mock";
import { USER_SERVICE } from "../../user-service/ioc";
import { IUserService } from "../../user-service/IUserService";
import { BookingConfirmationEmailParams } from "../contract/bookingConfirmationEmailParams";
import { DeskApproverConfirmationEmailParams } from "../contract/deskApproverConfirmationEmailParams";
import { NotificationCreateRequest } from "../contract/notificationCreateRequest";
import { NotificationRecipientType } from "../contract/notificationRecipientType";
import { NotificationSendRequest } from "../contract/notificationSendRequest";
import { NOTIFICATION_STATUS_TYPE } from "../contract/notificationStatusType";
import { NotificationUpdateRequest } from "../contract/notificationUpdateRequest";
import { QuestionnaireNotificationType } from "../contract/questionnaireNotificationType";
import { NotificationEntity } from "../entity/notification.entity";
import { QuestionnarieNotificationEntity } from "../entity/questionnarie.notification.entity";
import { UserNotificationsHistoryEntity } from "../entity/userNotificationsHistory.entity";
import { INotificationService } from "../INotificationService";
import { NotificationMapper } from "../notification.mapper";
import { NotificationService } from "../notification.service";
import { NotificationServiceConfig } from "../notificationServiceConfig";
import { sendBookingConfirmationEmailTemplate } from "../templates/sendBookingConfirmationEmailTemplate";
import { sendBookingConfirmedEmailTemplate } from "../templates/sendBookingConfirmedEmailTemplate";
import { sendDeskApproverConfirmationEmailTemplate } from "../templates/sendDeskApproverConfirmationEmailTemplate";

describe("NotificationService", () => {
    let notificationService: INotificationService;
    let notificationRepo: IMockRepository;
    let userNotificationsHistoryRepo: IMockRepository;

    let questionnarieNotificationRepo: IMockRepository;
    let bookingService: IBookingService;
    let userService: IUserService;
    let mapper: NotificationMapper;
    let locationService: ILocationService;
    let covidQuestionService: ICovidQuestionService;

    const formatBookingDate = (booking: BookingEntity): string => {
        return `${moment(booking.dateFrom).format("MMM D")}, ${
            booking.timeFrom.length > 5 ? booking.timeFrom.substring(0, 5) : booking.timeFrom
        }-${booking.timeTo.length > 5 ? booking.timeTo.substring(0, 5) : booking.timeTo}`;
    };

    beforeAll(() => {
        process.env.WEBSITES_HOST = "mock_url";
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        const module = await Test.createTestingModule({
            providers: [
                NotificationService,
                NotificationMapper,
                NotificationServiceConfig,
                {
                    provide: getRepositoryToken(NotificationEntity),
                    useFactory: mockRepository
                },
                {
                    provide: getRepositoryToken(UserNotificationsHistoryEntity),
                    useFactory: mockRepository
                },
                {
                    provide: BookingService,
                    useFactory: mockBookingService
                },
                {
                    provide: USER_SERVICE,
                    useFactory: mockUserService
                },
                {
                    provide: LOCATION_SERVICE,
                    useFactory: mockLocationService
                },
                {
                    provide: COVID_QUESTION_SERVICE,
                    useFactory: mockCovidQuestionService
                },
                {
                    provide: NotificationServiceConfig,
                    useFactory: () => {
                        return {
                            baseUrl: "NOTIFICATION_SERVICE_URL"
                        };
                    }
                },
                {
                    provide: getRepositoryToken(QuestionnarieNotificationEntity),
                    useFactory: mockRepository
                }
            ]
        }).compile();

        notificationService = module.get(NotificationService);
        notificationRepo = module.get(getRepositoryToken(NotificationEntity));
        questionnarieNotificationRepo = module.get(getRepositoryToken(QuestionnarieNotificationEntity));
        userNotificationsHistoryRepo = module.get(getRepositoryToken(UserNotificationsHistoryEntity));
        mapper = module.get(NotificationMapper);

        bookingService = module.get(BookingService);
        locationService = module.get(LOCATION_SERVICE);
        userService = module.get(USER_SERVICE);
        covidQuestionService = module.get(COVID_QUESTION_SERVICE);
    });

    const mockQuestionarySchedule = {
        id: "schedule_id",
        startTime: 1,
        reminderTime: 15,
        cancellationTime: 17,
        location: createMockLocation(),
        isActive: true
    };
    const mockBookingId = "booking_id";

    const notificationId = "notification_id";
    const notification: NotificationEntity = {
        id: "notification_id",
        location: createMockLocation(),
        message: "notification_message",
        status: NOTIFICATION_STATUS_TYPE.PENDING,
        recipients: NotificationRecipientType.ALL,
        subject: "notification_subject",
        endDate: null,
        sendDate: null,
        startDate: null,
        createdAt: new Date(),
        timeToExecuteInLocationTimeZone: null
    };

    const mockLocation = createMockLocation();
    const mockUserNotificationHistoryEntity: UserNotificationsHistoryEntity = {
        id: "mock_id",
        isWatched: false,
        message: "test_message",
        subject: "test_subject",
        sendDate: new Date(),
        user: mockUserEntity
    };

    it("should return list of notification of a certain location", async () => {
        const locationId = "location_id";
        const getSpy = jest.spyOn(notificationRepo, "findAndCount").mockResolvedValueOnce([[notification], 1]);

        await notificationService.getNotifications(locationId, {});

        expect(getSpy).toHaveBeenCalledWith({
            where: { location: locationId },
            relations: ["location"],
            skip: 0,
            take: 10,
            order: {
                createdAt: "DESC"
            }
        });
    });

    it("should create notification", async () => {
        const body: NotificationCreateRequest = {
            locationId: "location_id",
            message: "notification_message",
            recipients: NotificationRecipientType.HAS_BOOKING,
            subject: "notification_subject",
            endDate: new Date(),
            startDate: new Date(),
            sendDate: null
        };
        const notificationEntity: NotificationEntity = {
            id: "notification_id",
            status: NOTIFICATION_STATUS_TYPE.PENDING,
            createdAt: new Date("2021-06-29"),
            location: mockLocation,
            message: "notification_message",
            recipients: NotificationRecipientType.HAS_BOOKING,
            subject: "notification_subject",
            endDate: new Date(),
            startDate: new Date(),
            sendDate: null,
            timeToExecuteInLocationTimeZone: null
        };

        const getLocationSpy = jest.spyOn(locationService, "getLocationById").mockResolvedValueOnce(mockLocation);
        jest.spyOn(notificationRepo, "create").mockReturnValueOnce(notificationEntity);
        const createSpy = jest.spyOn(notificationRepo, "save").mockResolvedValueOnce(notificationEntity);

        await notificationService.createNotification(body);

        expect(getLocationSpy).toHaveBeenCalledWith(body.locationId);
        expect(createSpy).toHaveBeenCalledWith(notificationEntity);
    });

    it("should get notification by id", async () => {
        const getSpy = jest.spyOn(notificationRepo, "findOne").mockResolvedValueOnce("");

        await notificationService.getNotificationById(notificationId);
        expect(getSpy).toHaveBeenCalledWith(notificationId, { relations: ["location"] });
    });

    it("should remove notification by id", async () => {
        const removeSpy = jest.spyOn(notificationRepo, "delete").mockResolvedValueOnce("");

        await notificationService.removeNotification(notificationId);
        expect(removeSpy).toHaveBeenCalledWith(notificationId);
    });

    it("should update notification", async () => {
        const request: NotificationUpdateRequest = {
            subject: "updated_subject",
            message: "updated_message",
            recipients: NotificationRecipientType.ALL,
            endDate: null,
            sendDate: null,
            startDate: null
        };

        const findSpy = jest.spyOn(notificationRepo, "findOne").mockResolvedValueOnce(notification);
        const updateSpy = jest.spyOn(notificationRepo, "save").mockResolvedValueOnce("");

        await notificationService.updateNotification(notificationId, request);

        expect(findSpy).toHaveBeenCalledWith(notificationId);
        expect(updateSpy).toHaveBeenCalledWith({
            ...request,
            id: notificationId,
            status: NOTIFICATION_STATUS_TYPE.PENDING
        });
    });

    it("should update isWatched status of user notification", async () => {
        const notificationId = mockUserNotificationHistoryEntity.id;
        const isWatched = true;

        userNotificationsHistoryRepo.findOne.mockResolvedValueOnce(mockUserNotificationHistoryEntity);
        const saveSpy = jest.spyOn(userNotificationsHistoryRepo, "save");

        await notificationService.updateNotificationWatchStatus(notificationId);

        expect(saveSpy).toHaveBeenCalledWith({
            ...mockUserNotificationHistoryEntity,
            isWatched
        });
    });

    it("should send admin notification", async () => {
        const body: NotificationSendRequest = {
            recipientType: NotificationRecipientType.ALL,
            endDate: null,
            startDate: null
        };
        const bookingUserIds = ["user_id"];
        const recipients = [mockUserEntity.email];
        const sendDate = new Date();
        const isWatched = false;

        const userNotificationHistoryEntityMock: UserNotificationsHistoryEntity = {
            id: uuid.v4(),
            message: notification.message,
            subject: notification.subject,
            sendDate,
            isWatched,
            user: mockUserEntity
        };

        const findSpy = jest.spyOn(notificationRepo, "findOne").mockResolvedValueOnce(notification);
        const getBookingUserIdsSpy = jest
            .spyOn(bookingService, "getBookingUserIdsByLocationId")
            .mockResolvedValueOnce(bookingUserIds);
        const getUsersSpy = jest.spyOn(userService, "getUsersByIds").mockResolvedValueOnce([mockUserEntity]);
        const updateSpy = jest.spyOn(notificationRepo, "save").mockResolvedValueOnce("");

        jest.spyOn(axios, "create").mockReturnThis();
        const sendSpy = jest.spyOn(axios, "post").mockResolvedValueOnce("");
        const sendPushSpy = jest.spyOn(axios, "post").mockResolvedValueOnce("");

        jest.spyOn(mapper, "mapToUserNotificationHistoryEntity").mockReturnValueOnce(userNotificationHistoryEntityMock);
        const mapSaveHistorySpy = jest.spyOn(userNotificationsHistoryRepo, "save");

        await notificationService.sendAdminNotification(notificationId, body);

        expect(findSpy).toHaveBeenCalledWith(notificationId, { relations: ["location"] });
        expect(getBookingUserIdsSpy).toHaveBeenLastCalledWith(notification.location.id);
        expect(getUsersSpy).toHaveBeenLastCalledWith(bookingUserIds);
        expect(sendSpy).toHaveBeenCalledWith("/api/notifications/notification-email", {
            notificationSubject: notification.subject,
            notificationText: notification.message,
            recipients
        });

        expect(sendPushSpy).toHaveBeenCalledWith("/api/notifications/notification-push", {
            notificationSubject: notification.subject,
            notificationText: notification.message,
            deviceToken: mockUserEntity.deviceTokens
        });

        expect(updateSpy).toHaveBeenCalledWith({ ...notification, status: NOTIFICATION_STATUS_TYPE.SENT });

        expect(mapSaveHistorySpy).toHaveBeenCalledWith(userNotificationHistoryEntityMock);
    });

    it("should send questionnaire start email and push notifications", async () => {
        const location = mockCustomBooking.location.locationName;
        const notificationSubject = "Questionnaire start notification";
        const notificationText = `Dear ${
            mockUserEntity.name
        }, please take a questionnaire to confirm your booking ${location}, ${mockCustomBooking.desk.name} on ${moment(
            mockCustomBooking.dateFrom
        ).format("YYYY-MM-DD")} ${
            mockCustomBooking.timeFrom
        }. In case if you are not complete the questionnaire your booking will be canceled.
        <br><br>
        <a href="${process.env.WEBSITES_HOST}" target="_blank">Here's the link to questionnaire</a>`;

        const getBookingSpy = jest
            .spyOn(bookingService, "getBookingById")
            .mockResolvedValueOnce(mockCustomBookingEntity);
        const getUserSpy = jest.spyOn(userService, "getUserById").mockResolvedValueOnce(mockUserEntity);

        jest.spyOn(axios, "create").mockReturnThis();
        const sendSpy = jest.spyOn(axios, "post").mockResolvedValueOnce("");
        const sendPushSpy = jest.spyOn(axios, "post").mockResolvedValueOnce("");

        await notificationService.sendQuestionnaireStartNotification(mockCustomBooking.id);

        expect(getBookingSpy).toHaveBeenLastCalledWith(mockCustomBooking.id);
        expect(getUserSpy).toHaveBeenLastCalledWith(mockCustomBooking.userId);
        expect(sendSpy).toHaveBeenCalledWith("/api/notifications/notification-email", {
            notificationSubject,
            notificationText,
            recipients: [mockUserEntity.email]
        });
        expect(sendPushSpy).toHaveBeenCalledWith("/api/notifications/notification-push", {
            notificationSubject,
            notificationText,
            deviceToken: mockUserEntity.deviceTokens,
            locationId: mockCustomBooking.location.id,
            bookingId: mockCustomBooking.id
        });
    });

    it("should send questionnaire reminder email and push notifications", async () => {
        const remainedTimeInMinutes = 15;
        const location = mockCustomBooking.location.locationName;
        const notificationSubject = "Questionnaire remained time notification";
        const notificationText = `Dear ${
            mockUserEntity.name
        }, please hurry up and take a questionnaire to confirm your booking ${location}, ${
            mockCustomBooking.desk.name
        } on ${moment(mockCustomBooking.dateFrom).format("YYYY-MM-DD")} ${
            mockCustomBooking.timeFrom
        }. Your booking will be canceled in ${remainedTimeInMinutes} minutes.
        <br><br>
        <a href="${process.env.WEBSITES_HOST}" target="_blank">Here's the link to questionnaire</a>`;



        const getBookingSpy = jest
            .spyOn(bookingService, "getBookingById")
            .mockResolvedValueOnce(mockCustomBookingEntity);
        const getUserSpy = jest.spyOn(userService, "getUserById").mockResolvedValueOnce(mockUserEntity);

        jest.spyOn(axios, "create").mockReturnThis();
        const sendSpy = jest.spyOn(axios, "post").mockReturnThis();
        const sendPushSpy = jest.spyOn(axios, "post").mockReturnThis();
        jest.spyOn(covidQuestionService, "getCovidQuestionnaireScheduleConfig").mockResolvedValueOnce(
            mockQuestionarySchedule
        );

        await notificationService.sendQuestionnaireReminder(mockCustomBooking.id, remainedTimeInMinutes);
  
        expect(getBookingSpy).toHaveBeenLastCalledWith(mockCustomBooking.id);
        expect(getUserSpy).toHaveBeenLastCalledWith(mockCustomBooking.userId);
        expect(sendSpy).toHaveBeenCalledWith("/api/notifications/notification-email", {
            notificationSubject,
            notificationText,
            recipients: [mockUserEntity.email]
        });
        expect(sendPushSpy).toHaveBeenCalledWith("/api/notifications/notification-push", {
            notificationSubject,
            notificationText,
            deviceToken: mockUserEntity.deviceTokens
        });
    });

    it("should send questionnaire based cancellation email and push notifications", async () => {
        const location = mockCustomBooking.location.locationName;
        const notificationSubject = "Booking cancel notification";
        const notificationText = `Dear ${mockUserEntity.name}, your booking for ${location}, ${
            mockCustomBooking.desk.name
        } on ${moment(mockCustomBooking.dateFrom).format("YYYY-MM-DD")} ${mockCustomBooking.timeFrom} was canceled. `;

        const getBookingSpy = jest
            .spyOn(bookingService, "getBookingById")
            .mockResolvedValueOnce(mockCustomBookingEntity);
        const getUserSpy = jest.spyOn(userService, "getUserById").mockResolvedValueOnce(mockUserEntity);
        const cancelBookingSpy = jest.spyOn(bookingService, "cancelBooking");

        jest.spyOn(axios, "create").mockReturnThis();
        const sendSpy = jest.spyOn(axios, "post").mockResolvedValueOnce("");
        const sendPushSpy = jest.spyOn(axios, "post").mockResolvedValueOnce("");

        await notificationService.sendQuestionnaireBasedCancelBookingNotification(mockCustomBooking.id);

        expect(getBookingSpy).toHaveBeenLastCalledWith(mockCustomBooking.id);
        expect(getUserSpy).toHaveBeenLastCalledWith(mockCustomBooking.userId);
        expect(sendSpy).toHaveBeenCalledWith("/api/notifications/notification-email", {
            notificationSubject,
            notificationText,
            recipients: [mockUserEntity.email]
        });
        expect(sendPushSpy).toHaveBeenCalledWith("/api/notifications/notification-push", {
            notificationSubject,
            notificationText,
            deviceToken: mockUserEntity.deviceTokens
        });
        expect(cancelBookingSpy).toHaveBeenCalledWith(mockCustomBooking.id);
    });

    it("should send cancel booking by admin email and push notification", async () => {
        const location = mockCustomBooking.location.locationName;
        const notificationSubject = "Booking cancelled notification";
        const notificationText = `Dear ${mockUserEntity.name}, your booking ${location}, ${mockCustomBooking.desk.name}, ${mockCustomBooking.dateFrom} was canceled by admin.`;

        const getBookingSpy = jest
            .spyOn(bookingService, "getBookingById")
            .mockResolvedValueOnce(mockCustomBookingEntity);
        const getUserSpy = jest.spyOn(userService, "getUserById").mockResolvedValueOnce(mockUserEntity);

        jest.spyOn(axios, "create").mockReturnThis();
        const sendSpy = jest.spyOn(axios, "post").mockResolvedValueOnce("");
        const sendPushSpy = jest.spyOn(axios, "post").mockResolvedValueOnce("");

        await notificationService.sendCancelBookingByAdminNotification(mockCustomBooking.id);

        expect(getBookingSpy).toHaveBeenLastCalledWith(mockCustomBooking.id);
        expect(getUserSpy).toHaveBeenLastCalledWith(mockCustomBooking.userId);
        expect(sendSpy).toHaveBeenCalledWith("/api/notifications/notification-email", {
            notificationSubject,
            notificationText,
            recipients: [mockUserEntity.email]
        });
        expect(sendPushSpy).toHaveBeenCalledWith("/api/notifications/notification-push", {
            notificationSubject,
            notificationText,
            deviceToken: mockUserEntity.deviceTokens
        });
    });

    it("should send desk approver confirmation email", async () => {
        const params: DeskApproverConfirmationEmailParams = {
            desk: createMockDeskEntity(),
            email: mockUserEntity.email,
            token: "mock_token"
        };
        const notificationSubject = "Desk approver conformation";
        const notificationText = sendDeskApproverConfirmationEmailTemplate(params);

        jest.spyOn(axios, "create").mockReturnThis();
        const sendSpy = jest.spyOn(axios, "post").mockResolvedValueOnce("");

        await notificationService.sendDeskApproverConfirmationEmail(params);

        expect(sendSpy).toHaveBeenCalledWith("/api/notifications/notification-email", {
            notificationSubject,
            notificationText,
            recipients: [mockUserEntity.email]
        });
    });

    it("should send booking confirmation email", async () => {
        const params: BookingConfirmationEmailParams = {
            booking: mockCustomBookingEntity,
            approveToken: "approve_token",
            denyToken: "deny_token",
            email: mockUserEntity.email
        };
        const notificationSubject = "Approval required";
        const notificationText = sendBookingConfirmationEmailTemplate(params, formatBookingDate);

        jest.spyOn(axios, "create").mockReturnThis();
        const sendSpy = jest.spyOn(axios, "post").mockResolvedValueOnce("");

        await notificationService.sendBookingConfirmationEmail(params);

        expect(sendSpy).toHaveBeenCalledWith("/api/notifications/notification-email", {
            notificationSubject,
            notificationText,
            recipients: [mockUserEntity.email]
        });
    });

    it("should send booked email", async () => {
        const booking = mockCustomBookingEntity;
        const notificationSubject = "Booking confirmed";
        const notificationText = sendBookingConfirmedEmailTemplate({ booking }, formatBookingDate);

        jest.spyOn(axios, "create").mockReturnThis();
        const sendSpy = jest.spyOn(axios, "post").mockResolvedValueOnce("");

        await notificationService.sendBookingConfirmedEmail({ booking });

        expect(sendSpy).toHaveBeenCalledWith("/api/notifications/notification-email", {
            notificationSubject,
            notificationText,
            recipients: [booking.user.email]
        });
    });

    it("should save three questionnaire notifications for each booking", async () => {
        const bookingId = "booking_id";

        jest.spyOn(bookingService, "getBookingById").mockResolvedValueOnce(mockCustomBookingEntity);
        jest.spyOn(covidQuestionService, "getCovidQuestionnaireScheduleConfig").mockResolvedValueOnce(
            mockQuestionarySchedule
        );

        jest.spyOn(locationService, "getLocationById").mockResolvedValueOnce(mockLocation);

        const date = moment(mockCustomBooking.dateFrom).format("YYYY-MM-DD");

        const generateDate = (date: string, timeFrom: string) => moment(new Date(`${date} ${timeFrom}`)).utc();

        const format = "YYYY-MM-DD HH:mm:ssZ";
        let dateStringStart = generateDate(date, mockCustomBooking.timeFrom)
            .subtract(mockQuestionarySchedule.startTime, "hours")
            .format(format);

        let dateStringCancel = generateDate(date, mockCustomBooking.timeFrom)
            .subtract(mockQuestionarySchedule.cancellationTime, "minutes")
            .format(format);

        let dateStringReminder = generateDate(date, mockCustomBooking.timeFrom)
            .subtract(mockQuestionarySchedule.reminderTime, "minutes")
            .format(format);

        const mockJob1 = {
            id: "job_id_start",
            timeToExecuteInLocationTimeZone: dateStringStart,
            type: QuestionnaireNotificationType.QUESTIONNAIRE_START_NOTIFICATION,
            bookingId
        };
        const mockJob2 = {
            id: "job_id_reminder",
            timeToExecuteInLocationTimeZone: dateStringReminder,
            type: QuestionnaireNotificationType.QUESTIONNAIRE_REMINDER,
            bookingId,
            remainedTime: mockQuestionarySchedule.reminderTime
        };

        const mockJob3 = {
            id: "job_id_cancel",
            timeToExecuteInLocationTimeZone: dateStringCancel,
            type: QuestionnaireNotificationType.QUESTIONNAIRE_CANCEL_BOOKING_NOTIFICATION,
            bookingId
        };

        const saveSpy = jest
            .spyOn(questionnarieNotificationRepo, "save")
            .mockResolvedValueOnce([mockJob1, mockJob2, mockJob3]);

        await notificationService.createQuestionnaireNotifications(mockBookingId, mockLocation.id);

        expect(saveSpy).toHaveBeenCalledWith(questionnarieNotificationRepo.create([mockJob1, mockJob2, mockJob3]));
    });

    it("get questionnaire notifications", async () => {
        const now = moment();
        const getSpy = jest.spyOn(questionnarieNotificationRepo, "find");

        await notificationService.getQuestionnaireNotification(now);

        expect(getSpy).toHaveBeenCalledWith({
            where: { timeToExecuteInLocationTimeZone: now.format("YYYY-MM-DD HH:mm") },
            relations: ["booking"]
        });
    });

    it("should get admin notification by sendDate", async () => {
        const now = moment();
        const getSpy = jest.spyOn(notificationRepo, "find");

        await notificationService.getAdminNotificationsBySendDate(now);

        expect(getSpy).toHaveBeenCalledWith({
            where: {
                timeToExecuteInLocationTimeZone: now.format("YYYY-MM-DD HH:mm"),
                status: NOTIFICATION_STATUS_TYPE.PENDING
            }
        });
    });

    it("should execute soft delete: QuestionnaireNotification", async () => {
        const id = "id";
        const updateSpy = jest.spyOn(questionnarieNotificationRepo, "update");

        await notificationService.deleteQuestionnaireNotification(id);

        expect(updateSpy).toHaveBeenCalledWith(id, { isDeleted: true });
    });
});
