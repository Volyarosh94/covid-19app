import * as uuid from "uuid";
import { BookingType } from "../../booking-service/contract/bookingType";
import { IBookingService } from "../../booking-service/IBookingService";
import { IDeskService } from "../../desk-service/IDeskService";
import { ILocationService } from "../../location-service/ILocationService";
import { mockBookingService } from "../../testing/booking/booking.service.mock";
import {
    createBody,
    mockBookingId,
    mockBookingPaginationEntity,
    mockCustomBookingEntity,
    mockCustomBookingPresentation,
    mockDailyBookingEntity,
    mockDailyBookingPresentation,
    mockMappedWeeklyBookingEntities,
    mockPaginatedBookingPresentation,
    mockUserId,
    mockWeeklyBookingEntity,
    mockWeeklyBookingPresentation,
    mockWeeklyBookings
} from "../../testing/booking/data/mockBookingData";
import { mockDeskService } from "../../testing/desk/desk.service.mock";
import { createMockLocation } from "../../testing/location/data/mockLocationData";
import { mockLocationService } from "../../testing/location/location.service.mock";
import { BookingController } from "../controllers/booking.controller";
import { BookingPresentationMapper } from "../mappers/bookingPresentation.mapper";
import { DeskPresentationMapper } from "../mappers/deskPresentation.mapper";

describe("Booking Controller", () => {
    let bookingService: IBookingService;
    let controller: BookingController;
    let mapper: BookingPresentationMapper;
    let locationService: ILocationService;
    let deskService: IDeskService;
    let deskMapper: DeskPresentationMapper;

    beforeEach(() => {
        jest.clearAllMocks();

        deskMapper = new DeskPresentationMapper();
        mapper = new BookingPresentationMapper();
        bookingService = mockBookingService();
        locationService = mockLocationService();
        deskService = mockDeskService();
        controller = new BookingController(bookingService, locationService, mapper, deskService, deskMapper);
    });

    const locationId = uuid.v4();

    describe("getAll", () => {
        it("should return list of bookings", async () => {
            const getAllSpy = jest
                .spyOn(bookingService, "getBookings")
                .mockResolvedValueOnce(mockBookingPaginationEntity);

            mockBookingPaginationEntity.bookings.map((_, idx) =>
                jest
                    .spyOn(mapper, "mapBookingToPresentation")
                    .mockReturnValueOnce(mockPaginatedBookingPresentation.bookings[idx])
            );

            const result = await controller.getAll(mockUserId, {});

            expect(result).toMatchObject(mockPaginatedBookingPresentation);
            expect(result.bookings).toBeInstanceOf(Array);
            expect(getAllSpy).toHaveBeenCalledWith(mockUserId, {});
        });
    });

    describe("create", () => {
        it("should create custom booking", async () => {
            const mockLocation = createMockLocation();

            const createSpy = jest
                .spyOn(bookingService, "createCustomBooking")
                .mockResolvedValueOnce([mockCustomBookingEntity]);

            jest.spyOn(locationService, "getLocationById").mockResolvedValueOnce(mockLocation);
            jest.spyOn(mapper, "mapBookingToPresentation").mockReturnValueOnce(mockCustomBookingPresentation);

            const result = await controller.create(locationId, BookingType.CUSTOM, createBody, mockUserId);

            expect(result).toBeInstanceOf(Array);
            expect(result).toMatchObject([mockCustomBookingPresentation]);
            expect(createSpy).toHaveBeenCalledWith({ ...createBody, userId: mockUserId, location: mockLocation });
        });

        it("should create daily booking", async () => {
            const createRequest = {
                dateFrom: null,
                dateTo: null,
                timeFrom: "10:00 AM",
                timeTo: "12:00 PM",
                deskId: "desk_id",
                weekDay: null,
                selected: null,
                index: null
            };
            const mockLocation = createMockLocation();

            const createSpy = jest
                .spyOn(bookingService, "createDailyBooking")
                .mockResolvedValueOnce([mockDailyBookingEntity]);

            jest.spyOn(locationService, "getLocationById").mockResolvedValueOnce(mockLocation);
            jest.spyOn(mapper, "mapBookingToPresentation").mockReturnValueOnce(mockDailyBookingPresentation);

            const result = await controller.create(locationId, BookingType.DAILY, createRequest, mockUserId);

            expect(result).toMatchObject([mockDailyBookingPresentation]);
            expect(createSpy).toHaveBeenCalledWith({ ...createRequest, userId: mockUserId, location: mockLocation });
        });

        it("should crate weekly booking", async () => {
            const createRequest = [
                {
                    dateFrom: null,
                    dateTo: null,
                    timeFrom: "10:00 AM",
                    timeTo: "12:00 PM",
                    deskId: "desk_id",
                    weekDay: "Mon",
                    selected: true,
                    index: 1
                }
            ];
            const mockLocation = createMockLocation();
            const createSpy = jest
                .spyOn(bookingService, "createWeeklyBooking")
                .mockResolvedValueOnce(mockMappedWeeklyBookingEntities);

            jest.spyOn(locationService, "getLocationById").mockResolvedValueOnce(mockLocation);
            mockMappedWeeklyBookingEntities.map((_, idx) =>
                jest.spyOn(mapper, "mapBookingToPresentation").mockReturnValueOnce(mockWeeklyBookings[idx])
            );

            const result = await controller.create(locationId, BookingType.WEEKLY, createRequest, mockUserId);

            expect(result).toBeInstanceOf(Array);
            expect(result).toMatchObject(mockWeeklyBookings);
            expect(createSpy).toHaveBeenCalledWith([
                { ...createRequest[0], userId: mockUserId, location: mockLocation }
            ]);
        });
    });

    describe("get", () => {
        it("should get certain custom booking by id", async () => {
            const getBookingSpy = jest
                .spyOn(bookingService, "getBookingById")
                .mockResolvedValueOnce(mockCustomBookingEntity);
            jest.spyOn(mapper, "mapBookingToPresentation").mockReturnValueOnce(mockCustomBookingPresentation);

            const result = await controller.get(mockBookingId);

            expect(result).toMatchObject(mockCustomBookingPresentation);
            expect(getBookingSpy).toHaveBeenCalledWith(mockBookingId);
        });

        it("should get certain daily booking by id", async () => {
            const getBookingSpy = jest
                .spyOn(bookingService, "getBookingById")
                .mockResolvedValueOnce(mockDailyBookingEntity);
            jest.spyOn(mapper, "mapBookingToPresentation").mockReturnValueOnce(mockDailyBookingPresentation);

            const result = await controller.get(mockBookingId);

            expect(result).toMatchObject(mockDailyBookingPresentation);
            expect(getBookingSpy).toHaveBeenCalledWith(mockBookingId);
        });

        it("should get certain weekly booking by id", async () => {
            const getBookingSpy = jest
                .spyOn(bookingService, "getBookingById")
                .mockResolvedValueOnce(mockWeeklyBookingEntity);
            jest.spyOn(mapper, "mapBookingToPresentation").mockReturnValueOnce(mockWeeklyBookingPresentation);

            const result = await controller.get(mockBookingId);

            expect(result).toMatchObject(mockWeeklyBookingPresentation);
            expect(getBookingSpy).toHaveBeenCalledWith(mockBookingId);
        });
    });
});
