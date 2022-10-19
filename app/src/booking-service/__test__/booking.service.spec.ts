import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as _ from "lodash";
import * as moment from "moment";
import { Between, Not } from "typeorm";
import * as uuid from "uuid";
import { CalendarService } from "../../calendar-service/calendar.service";
import { ICalendarService } from "../../calendar-service/ICalendarService";
import { COVID_QUESTION_SERVICE } from "../../covid-question-service/ioc";
import { CRON_SERVICE } from "../../cron-service/ioc";
import { DeskEntity } from "../../desk-service/entity/desk.entity";
import { DeskResourceEntity } from "../../desk-service/entity/deskResource.entity";
import { IDeskService } from "../../desk-service/IDeskService";
import { DESK_SERVICE } from "../../desk-service/ioc";
import { LocationEntity } from "../../location-service/entity/location.entity";
import { LocationFloorEntity } from "../../location-service/entity/locationFloor.entity";
import { LOCATION_SERVICE } from "../../location-service/ioc";
import { NOTIFICATION_SERVICE } from "../../notification-service/ioc";
import {
    mockBookingCustomCreateRequest,
    mockBookingDailyCreateRequest,
    mockBookingWeeklyCreateRequest,
    mockCustomBooking,
    mockCustomBookingEntity,
    mockDailyBookingEntity,
    mockDeskApprovers,
    mockEmptyDisabledDays,
    mockMappedDailyBookingsEntities,
    mockMappedWeeklyBookingEntities,
    mockWeeklyBookingEntity
} from "../../testing/booking/data/mockBookingData";
import { mockCalendarService } from "../../testing/calendar.service.mock";
import { mockCovidQuestionService } from "../../testing/covid.question.service.mock";
import { mockCronService } from "../../testing/cron.service.mock";
import { createMockDeskEntity } from "../../testing/desk/data/mock.desk.data";
import { mockDeskService } from "../../testing/desk/desk.service.mock";
import { mockJWTService } from "../../testing/jwt.service.mock";
import { mockLocationService } from "../../testing/location/location.service.mock";
import { mockNotificationService } from "../../testing/notification.service.mock";
import { IMockRepository, mockRepository } from "../../testing/repository.mock";
import { mockUserEntity } from "../../testing/user/data/mockUserData";
import { mockUserService } from "../../testing/user/user.service.mock";
import { UserEntity } from "../../user-service/entity/user.entity";
import { USER_SERVICE } from "../../user-service/ioc";
import { IUserService } from "../../user-service/IUserService";
import { BookingMapper } from "../booking.mapper";
import { BookingService } from "../booking.service";
import { BOOKING_STATUS_TYPE } from "../contract/bookingStatusType";
import { BookingType } from "../contract/bookingType";
import { BookingEntity } from "../entity/booking.entity";
import { BookingApprovalsEntity } from "../entity/bookingApprovals.entity";
import { IBookingService } from "../IBookingService";
import { BookingValidator } from "../validators/bookingValidator";

describe("BookingService", () => {
    let bookingService: IBookingService;
    let deskService: IDeskService;
    let bookingRepo: IMockRepository;
    let mapper: BookingMapper;
    let validator: BookingValidator;
    let userService: IUserService;
    let calendarService: ICalendarService;

    const mockDeskEntity = createMockDeskEntity();
    const locationId = "location_id";
    const userId = "userId";

    beforeEach(async () => {
        jest.clearAllMocks();

        const module = await Test.createTestingModule({
            providers: [
                BookingService,
                BookingMapper,
                BookingValidator,
                {
                    provide: getRepositoryToken(BookingEntity),
                    useFactory: mockRepository
                },
                {
                    provide: getRepositoryToken(BookingApprovalsEntity),
                    useFactory: mockRepository
                },
                {
                    provide: DESK_SERVICE,
                    useFactory: mockDeskService
                },
                {
                    provide: LOCATION_SERVICE,
                    useFactory: mockLocationService
                },
                {
                    provide: JwtService,
                    useFactory: mockJWTService
                },
                {
                    provide: NOTIFICATION_SERVICE,
                    useFactory: mockNotificationService
                },
                {
                    provide: CRON_SERVICE,
                    useFactory: mockCronService
                },
                {
                    provide: USER_SERVICE,
                    useFactory: mockUserService
                },
                {
                    provide: COVID_QUESTION_SERVICE,
                    useFactory: mockCovidQuestionService
                },
                {
                    provide: CalendarService,
                    useFactory: mockCalendarService
                }
            ]
        }).compile();

        bookingService = module.get(BookingService);
        bookingRepo = module.get(getRepositoryToken(BookingEntity));
        mapper = module.get(BookingMapper);
        validator = module.get(BookingValidator);

        calendarService = module.get(CalendarService);
        deskService = module.get<IDeskService>(DESK_SERVICE);
        userService = module.get<IUserService>(USER_SERVICE);
    });

    it("should create custom booking without approver", async () => {
        const { dateFrom, dateTo, timeFrom, timeTo, deskId } = mockBookingCustomCreateRequest;
        const locationId = mockBookingCustomCreateRequest.location.id;

        const getDeskSpy = jest.spyOn(deskService, "getDeskById").mockResolvedValueOnce(mockDeskEntity);
        const getDeskApproversSpy = jest.spyOn(deskService, "getApprovers").mockResolvedValueOnce(mockDeskApprovers);
        const getUserSpy = jest.spyOn(userService, "getUserById").mockResolvedValueOnce(mockUserEntity);

        jest.spyOn(mapper, "mapCreateRequestToCustomBookingEntity").mockReturnValueOnce([mockCustomBookingEntity]);

        const validateTimeFormatSpy = jest.spyOn(validator, "validateTimeFormat").mockReturnValueOnce(true);
        const validateBookingDateSpy = jest.spyOn(validator, "validateBookingStartDate").mockReturnValueOnce(true);
        const validateBookingTimeSpy = jest.spyOn(validator, "validateBookingStartTime").mockReturnValueOnce(true);
        const validateBookingExistenceSpy = jest
            .spyOn(validator, "validateBookingExistence")
            .mockResolvedValueOnce(true);

        const createBasedOnDeskStatusSpy = jest.spyOn(bookingService, "createBookingBasedOnDeskStatus");
        const saveSpy = jest.spyOn(bookingRepo, "save").mockResolvedValueOnce(mockCustomBookingEntity);

        await bookingService.createCustomBooking(mockBookingCustomCreateRequest);

        expect(getDeskSpy).toHaveBeenCalledWith(deskId);
        expect(getUserSpy).toHaveBeenCalledWith(userId);
        expect(validateTimeFormatSpy).toHaveBeenCalledWith(timeFrom, timeTo);
        expect(validateBookingTimeSpy).toHaveBeenCalledWith(timeFrom, timeTo);
        expect(validateBookingDateSpy).toHaveBeenCalledWith(dateFrom, dateTo);
        expect(validateBookingExistenceSpy).toHaveBeenCalledWith({
            dateFrom,
            dateTo,
            timeFrom,
            timeTo,
            locationId,
            userId
        });
        expect(createBasedOnDeskStatusSpy).toHaveBeenCalledWith(mockCustomBookingEntity);
        expect(getDeskApproversSpy).toHaveBeenLastCalledWith(mockCustomBookingEntity.desk.id);
        expect(saveSpy).toHaveBeenCalledWith(mockCustomBookingEntity);
    });

    it("should create daily booking without approver", async () => {
        const { deskId, userId, timeFrom, timeTo } = mockBookingDailyCreateRequest;
        const locationId = mockBookingDailyCreateRequest.location.id;

        const getDeskSpy = jest.spyOn(deskService, "getDeskById").mockResolvedValueOnce(mockDeskEntity);
        const getUserSpy = jest.spyOn(userService, "getUserById").mockResolvedValueOnce(mockUserEntity);

        const mapToEntitySpy = jest
            .spyOn(mapper, "mapCreateRequestToDailyBookingEntity")
            .mockReturnValueOnce(mockMappedDailyBookingsEntities);

        const getDisabledDateSpy = jest.spyOn(calendarService, "getDisabledDates").mockResolvedValueOnce([]);
        const firstDate = mockMappedDailyBookingsEntities[0].dateFrom;
        const lastDate = _.last(mockMappedDailyBookingsEntities).dateFrom;

        const validateTimeFormatSpy = jest.spyOn(validator, "validateTimeFormat").mockReturnValueOnce(true);
        const validateBookingTimeSpy = jest.spyOn(validator, "validateBookingStartTime").mockReturnValueOnce(true);
        const validateBookingExistenceSpy = jest
            .spyOn(validator, "validateBookingExistence")
            .mockResolvedValueOnce(true);

        const mapSaveSpy = mockMappedDailyBookingsEntities.map((booking) =>
            jest.spyOn(bookingRepo, "save").mockResolvedValueOnce(booking)
        );

        await bookingService.createDailyBooking(mockBookingDailyCreateRequest);

        expect(getDisabledDateSpy).toHaveBeenCalledWith(locationId);
        expect(getDeskSpy).toHaveBeenCalledWith(deskId);
        expect(getUserSpy).toHaveBeenCalledWith(userId);

        expect(validateTimeFormatSpy).toHaveBeenCalledWith(timeFrom, timeTo);
        expect(validateBookingTimeSpy).toHaveBeenCalledWith(timeFrom, timeTo);
        expect(validateBookingExistenceSpy).toHaveBeenCalledWith({
            dateFrom: firstDate,
            dateTo: lastDate,
            timeFrom,
            timeTo,
            locationId,
            userId
        });
        expect(mapToEntitySpy).toHaveBeenCalledWith(mockBookingDailyCreateRequest, mockEmptyDisabledDays);

        mapSaveSpy.every((saveFn, idx) => {
            expect(saveFn).toHaveBeenCalledWith(mockMappedDailyBookingsEntities[idx]);
        });
    });

    it("should create weekly booking without approver", async () => {
        const getDeskSpy = jest.spyOn(deskService, "getDeskById").mockResolvedValueOnce(mockDeskEntity);

        const getDeskApproversSpy = mockMappedWeeklyBookingEntities.map((_) =>
            jest.spyOn(deskService, "getApprovers").mockResolvedValueOnce(mockDeskApprovers)
        );
        const getDisabledDateSpy = jest.spyOn(calendarService, "getDisabledDates").mockResolvedValueOnce([]);
        const getUserSpy = jest.spyOn(userService, "getUserById").mockResolvedValueOnce(mockUserEntity);

        const mapToBookingEntitySpy = jest
            .spyOn(mapper, "mapCreateRequestToWeeklyBookingEntity")
            .mockReturnValueOnce(mockMappedWeeklyBookingEntities);
        const firstDate = mockMappedWeeklyBookingEntities[0].dateFrom;
        const lastDate = _.last(mockMappedWeeklyBookingEntities).dateFrom;

        const validateTimeFormatSpy = jest.spyOn(validator, "validateTimeFormat").mockReturnValueOnce(true);
        const validateBookingTimeSpy = jest.spyOn(validator, "validateBookingStartTime").mockReturnValueOnce(true);
        const validateBookingExistenceSpy = jest
            .spyOn(validator, "validateBookingExistence")
            .mockResolvedValueOnce(true);

        const mapSaveSpy = mockMappedWeeklyBookingEntities.map((_, idx) =>
            jest.spyOn(bookingRepo, "save").mockResolvedValueOnce(mockMappedWeeklyBookingEntities[idx])
        );

        const createBasedOnDeskStatusSpy = mockMappedWeeklyBookingEntities.map((_) =>
            jest.spyOn(bookingService, "createBookingBasedOnDeskStatus")
        );

        await bookingService.createWeeklyBooking(mockBookingWeeklyCreateRequest);

        mockBookingWeeklyCreateRequest.every((data) => {
            expect(getDeskSpy).toHaveBeenCalledWith(data.deskId);
            expect(getUserSpy).toHaveBeenCalledWith(data.userId);
            expect(getDisabledDateSpy).toHaveBeenCalledWith(locationId);
            expect(validateTimeFormatSpy).toHaveBeenCalledWith(data.timeFrom, data.timeTo);
            expect(validateBookingTimeSpy).toHaveBeenCalledWith(data.timeFrom, data.timeTo);
            expect(validateBookingExistenceSpy).toHaveBeenCalledWith({
                dateFrom: firstDate,
                dateTo: lastDate,
                timeFrom: data.timeFrom,
                timeTo: data.timeTo,
                locationId,
                userId
            });
            expect(mapToBookingEntitySpy).toHaveBeenCalledWith(data, mockEmptyDisabledDays);

            createBasedOnDeskStatusSpy.map((createFn, idx) => {
                expect(createFn).toHaveBeenCalledWith(mockMappedWeeklyBookingEntities[idx]);
            });
            getDeskApproversSpy.every((getApproverFn) => {
                expect(getApproverFn).toHaveBeenCalledWith(mockWeeklyBookingEntity.desk.id);
            });
            mapSaveSpy.every((saveFn, idx) => {
                expect(saveFn).toHaveBeenCalledWith(mockMappedWeeklyBookingEntities[idx]);
            });
        });
    });

    it("should return all bookings", async () => {
        const qbuilder = bookingRepo.createQueryBuilder();

        jest.spyOn(qbuilder, "getManyAndCount").mockResolvedValueOnce([
            [mockCustomBookingEntity, mockDailyBookingEntity, mockWeeklyBookingEntity],
            3
        ]);

        await bookingService.getBookings(userId, {});

        expect(qbuilder.leftJoinAndMapOne).nthCalledWith(
            1,
            "booking.location",
            LocationEntity,
            "location",
            "booking.locationId = location.id"
        );
        expect(qbuilder.leftJoinAndMapOne).nthCalledWith(
            2,
            "booking.desk",
            DeskEntity,
            "desk",
            "booking.deskId = desk.id"
        );
        expect(qbuilder.leftJoinAndMapOne).nthCalledWith(
            3,
            "desk.floor",
            LocationFloorEntity,
            "floor",
            "desk.floorId = floor.id"
        );
        expect(qbuilder.leftJoinAndMapOne).nthCalledWith(
            4,
            "booking.user",
            UserEntity,
            "user",
            "booking.userId = user.id"
        );
        expect(qbuilder.leftJoinAndMapMany).toBeCalledWith(
            "desk.deskResources",
            DeskResourceEntity,
            "deskResources",
            "deskResources.deskId = desk.id"
        );
        expect(qbuilder.leftJoinAndSelect).toBeCalledWith("deskResources.resource", "resource");
        expect(qbuilder.andWhere).toHaveBeenCalledWith("booking.userId = :userId", { userId });

        expect(qbuilder.skip).toHaveBeenCalledWith(0);
        expect(qbuilder.take).toHaveBeenCalledWith(100);
        expect(qbuilder.getManyAndCount).toHaveBeenCalled();
    });

    it("should get a certain booking by id", async () => {
        const qBuilder = bookingRepo.createQueryBuilder();
        jest.spyOn(qBuilder, "getOne").mockImplementationOnce(() => Promise.resolve(mockCustomBookingEntity));

        await bookingService.getBookingById(mockCustomBooking.id);

        expect(qBuilder.leftJoinAndMapOne).nthCalledWith(
            1,
            "booking.location",
            LocationEntity,
            "location",
            "booking.locationId = location.id"
        );
        expect(qBuilder.leftJoinAndMapOne).nthCalledWith(
            2,
            "booking.desk",
            DeskEntity,
            "desk",
            "booking.deskId = desk.id"
        );
        expect(qBuilder.leftJoinAndMapOne).nthCalledWith(
            3,
            "desk.floor",
            LocationFloorEntity,
            "floor",
            "desk.floorId = floor.id"
        );
        expect(qBuilder.leftJoinAndMapOne).nthCalledWith(
            4,
            "booking.user",
            UserEntity,
            "user",
            "booking.userId = user.id"
        );
        expect(qBuilder.leftJoinAndMapMany).toBeCalledWith(
            "desk.deskResources",
            DeskResourceEntity,
            "deskResources",
            "deskResources.deskId = desk.id"
        );
        expect(qBuilder.leftJoinAndSelect).toBeCalledWith("deskResources.resource", "resource");
        expect(qBuilder.andWhere).toHaveBeenCalledWith("booking.id = :bookingId", {
            bookingId: mockCustomBooking.id
        });
        expect(qBuilder.getOne).toHaveBeenCalled();
    });

    it("should return null if booking not found", async () => {
        bookingRepo.findOne.mockImplementationOnce(() => null);

        const id = uuid.v4();
        const result = await bookingService.getBookingById(id);

        expect(result).toBe(null);
    });

    it("should cancel custom booking", async () => {
        bookingRepo.findOne.mockImplementationOnce(() => mockCustomBooking);
        bookingRepo.save.mockResolvedValueOnce({ ...mockCustomBookingEntity, status: BOOKING_STATUS_TYPE.CANCELED });

        const qBuilder = bookingRepo.createQueryBuilder();
        jest.spyOn(qBuilder, "getOne").mockImplementationOnce(() =>
            Promise.resolve({ ...mockCustomBookingEntity, status: BOOKING_STATUS_TYPE.CANCELED })
        );

        await bookingService.cancelBooking(mockCustomBooking.id);
        const result = await bookingService.getBookingById(mockCustomBooking.id);

        expect(result.status).toBe(BOOKING_STATUS_TYPE.CANCELED);
    });

    it("should get booked time slots of custom bookings", async () => {
        const deskId = "desk_id";
        const monthNumber = 6;
        const startOfMonthDate = moment(new Date(`${moment().year()}-${monthNumber}`))
            .startOf("month")
            .format("YYYY-MM-DD HH:mm:ssZ");
        const endOfMonthDate = moment(new Date(`${moment().year()}-${monthNumber}`))
            .endOf("month")
            .format("YYYY-MM-DD HH:mm:ssZ");

        const getSpy = jest.spyOn(bookingRepo, "find").mockResolvedValueOnce([mockCustomBookingEntity]);
        const mapSpy = jest.spyOn(mapper, "mapToCustomBookingBookedDateTimeSlot");

        await bookingService.getBookedTimeSlotsByDeskIdAndMonth(deskId, monthNumber);

        expect(getSpy).toHaveBeenCalledWith({
            where: {
                status: Not(BOOKING_STATUS_TYPE.CANCELED),
                dateFrom: Between(startOfMonthDate, endOfMonthDate),
                desk: deskId,
                type: BookingType.CUSTOM
            }
        });
        expect(mapSpy).toHaveBeenCalledWith([mockCustomBookingEntity]);
    });
});
