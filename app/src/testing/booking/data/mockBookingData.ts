import * as moment from "moment";
import * as uuid from "uuid";
import { BookingCreateBody } from "../../../api/dto/booking/bookingCreateBody.dto";
import { BookingsPaginatedPresentation } from "../../../api/dto/booking/bookingPaginatedPresentation.dto";
import { BookingPresentation } from "../../../api/dto/booking/bookingPresentation.dto";
import { BookingCustomCreateRequest } from "../../../booking-service/contract/bookingCustomCreateRequest";
import { BookingDailyCreateRequest } from "../../../booking-service/contract/bookingDailyCreateRequest";
import { BookingPagination } from "../../../booking-service/contract/bookingPagination";
import { BOOKING_STATUS_TYPE } from "../../../booking-service/contract/bookingStatusType";
import { BookingType } from "../../../booking-service/contract/bookingType";
import { BookingWeeklyCreateRequest } from "../../../booking-service/contract/bookingWeeklyCreateRequest";
import { BookingEntity } from "../../../booking-service/entity/booking.entity";
import { DeskApproverEntity } from "../../../desk-service/entity/deskApprover.entity";
import { createMockDesk, createMockDeskEntity } from "../../desk/data/mock.desk.data";
import { createMockLocation } from "../../location/data/mockLocationData";
import { mockUserEntity } from "../../user/data/mockUserData";

const mockLocation = createMockLocation();
const mockDesk = createMockDesk();
export const mockUserId = "userId";

const mockFloor = {
    id: uuid.v4(),
    floorName: "Floor_1",
    locationId: mockLocation.id
};
const mockResource = {
    id: uuid.v4(),
    locationId: mockLocation.id,
    name: "Resource_1",
    isAvailable: true,
    createdAt: ("2021-05-11" as unknown) as Date
};
export const mockBookingId = "booking_id";

export const mockCustomBookingPresentation: BookingPresentation = {
    id: mockBookingId,
    dateFrom: "10/12/2021",
    dateTo: "10/12/2021",
    timeFrom: "10:00 AM",
    timeTo: "12:00 PM",
    userId: mockUserId,
    status: BOOKING_STATUS_TYPE.BOOKED,
    location: mockLocation,
    floor: mockFloor,
    desk: mockDesk,
    index: null,
    selected: null,
    weekDay: null,
    type: BookingType.CUSTOM,
    hasPassedQuestionnaire: null
};

export const mockDailyBookingPresentation: BookingPresentation = {
    id: mockBookingId,
    dateFrom: null,
    dateTo: null,
    timeFrom: "10:00 AM",
    timeTo: "12:00 PM",
    userId: mockUserId,
    status: BOOKING_STATUS_TYPE.BOOKED,
    location: mockLocation,
    floor: mockFloor,
    desk: {
        id: mockDesk.id,
        name: mockDesk.name,
        owner: "userId",
        floorId: mockDesk.floorId,
        sectionId: mockDesk.sectionId,
        section: mockDesk.section,
        status: mockDesk.status,
        resources: [mockResource]
    },
    index: null,
    selected: null,
    weekDay: null,
    type: BookingType.DAILY,
    hasPassedQuestionnaire: null
};

export const mockWeeklyBookingPresentation: BookingPresentation = {
    id: mockBookingId,
    dateFrom: null,
    dateTo: null,
    timeFrom: "10:00 AM",
    timeTo: "12:00 PM",
    userId: mockUserId,
    status: BOOKING_STATUS_TYPE.BOOKED,
    location: mockLocation,
    floor: mockFloor,
    desk: {
        id: mockDesk.id,
        name: mockDesk.name,
        owner: "userId",
        floorId: mockDesk.floorId,
        sectionId: mockDesk.sectionId,
        section: mockDesk.section,
        status: mockDesk.status,
        resources: [mockResource]
    },
    index: 1,
    selected: true,
    weekDay: "Mon",
    type: BookingType.WEEKLY,
    hasPassedQuestionnaire: null
};

export const mockPaginatedBookingPresentation: BookingsPaginatedPresentation = {
    totalCount: 1,
    page: 1,
    limit: 100,
    bookings: [mockCustomBookingPresentation, mockDailyBookingPresentation, mockWeeklyBookingPresentation]
};

export const createBody: BookingCreateBody = {
    dateFrom: "10/12/2021",
    dateTo: "12/12/2021",
    timeFrom: "10:00 AM",
    timeTo: "12:00 PM",
    deskId: "desk_id",
    weekDay: null,
    selected: null,
    index: null
};

export const mockMappedDailyBookingsEntities: BookingEntity[] = [
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("31/08/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("31/08/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("01/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("01/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("02/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("02/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("03/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("03/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("04/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("04/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("05/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("05/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("06/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("06/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("07/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("07/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("08/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("08/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("09/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("09/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("10/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("10/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("11/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("11/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("12/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("12/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: (moment(new Date("13/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        dateTo: (moment(new Date("13/09/21")).utc().format("YYYY-MM-DD") as unknown) as string,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        type: BookingType.DAILY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    }
];

const mockDeskEntity = createMockDeskEntity();

export const mockCustomBooking: BookingPresentation = {
    id: mockBookingId,
    dateFrom: (moment(new Date("10/12/2021")).format("YYYY-MM-DD") as unknown) as string,
    dateTo: (moment(new Date("10/12/2021")).format("YYYY-MM-DD") as unknown) as string,
    timeFrom: "10:00 AM",
    timeTo: "12:00 PM",
    location: mockLocation,
    floor: mockFloor,
    desk: mockDesk,
    userId: mockUserId,
    status: BOOKING_STATUS_TYPE.BOOKED,
    type: BookingType.CUSTOM,
    hasPassedQuestionnaire: null
};

export const mockDailyBooking: BookingPresentation = {
    id: mockBookingId,
    timeFrom: "10:00 AM",
    timeTo: "12:00 PM",
    dateFrom: new Date().toString(),
    dateTo: new Date().toString(),
    location: mockLocation,
    floor: mockFloor,
    desk: mockDesk,
    userId: mockUserId,
    status: BOOKING_STATUS_TYPE.BOOKED,
    type: BookingType.DAILY,
    hasPassedQuestionnaire: null
};

export const mockWeeklyBookings: BookingPresentation[] = [
    {
        id: mockBookingId,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        dateFrom: "11/09/21",
        dateTo: "11/09/21",
        location: mockLocation,
        floor: mockFloor,
        desk: mockDesk,
        userId: mockUserId,
        status: BOOKING_STATUS_TYPE.BOOKED,
        index: 1,
        selected: true,
        weekDay: "Mon",
        type: BookingType.WEEKLY,
        hasPassedQuestionnaire: null
    },
    {
        id: mockBookingId,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        dateFrom: "18/09/21",
        dateTo: "18/09/21",
        location: mockLocation,
        floor: mockFloor,
        desk: mockDesk,
        userId: mockUserId,
        status: BOOKING_STATUS_TYPE.BOOKED,
        index: 1,
        selected: true,
        weekDay: "Mon",
        type: BookingType.WEEKLY,
        hasPassedQuestionnaire: null
    },
    {
        id: mockBookingId,
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        dateFrom: "25/09/21",
        dateTo: "25/09/21",
        location: mockLocation,
        floor: mockFloor,
        desk: mockDesk,
        userId: mockUserId,
        status: BOOKING_STATUS_TYPE.BOOKED,
        index: 1,
        selected: true,
        weekDay: "Mon",
        type: BookingType.WEEKLY,
        hasPassedQuestionnaire: null
    }
];

export const mockMappedWeeklyBookingEntities: BookingEntity[] = [
    {
        id: mockBookingId,
        dateFrom: "11/09/21",
        dateTo: "11/09/21",
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        index: 1,
        selected: true,
        weekDay: "Mon",
        type: BookingType.WEEKLY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: "18/09/21",
        dateTo: "18/09/21",
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        index: 1,
        selected: true,
        weekDay: "Mon",
        type: BookingType.WEEKLY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    },
    {
        id: mockBookingId,
        dateFrom: "25/09/21",
        dateTo: "25/09/21",
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        user: mockUserEntity,
        desk: createMockDeskEntity(),
        index: 1,
        selected: true,
        weekDay: "Mon",
        type: BookingType.WEEKLY,
        hasPassedQuestionnaire: null,
        status: BOOKING_STATUS_TYPE.BOOKED
    }
];

export const mockCustomBookingEntity: BookingEntity = {
    id: mockBookingId,
    dateFrom: (moment(new Date("10/12/2021")).format("YYYY-MM-DD") as unknown) as string,
    dateTo: (moment(new Date("10/12/2021")).format("YYYY-MM-DD") as unknown) as string,
    timeFrom: "10:00 AM",
    timeTo: "12:00 PM",
    location: mockLocation,
    user: mockUserEntity,
    desk: mockDeskEntity,
    type: BookingType.CUSTOM,
    status: BOOKING_STATUS_TYPE.BOOKED,
    hasPassedQuestionnaire: null
};

export const mockDailyBookingEntity: BookingEntity = {
    id: mockBookingId,
    dateFrom: (moment(new Date()).utc().format("YYYY-MM-DD") as unknown) as string,
    dateTo: (moment(new Date()).utc().format("YYYY-MM-DD") as unknown) as string,
    timeFrom: "10:00 AM",
    timeTo: "12:00 PM",
    location: mockLocation,
    user: mockUserEntity,
    desk: mockDeskEntity,
    type: BookingType.DAILY,
    status: BOOKING_STATUS_TYPE.PENDING,
    hasPassedQuestionnaire: null
};

export const mockWeeklyBookingEntity: BookingEntity = {
    id: mockBookingId,
    timeFrom: "10:00 AM",
    timeTo: "12:00 PM",
    location: mockLocation,
    user: mockUserEntity,
    desk: mockDeskEntity,
    index: 1,
    selected: true,
    weekDay: "Mon",
    type: BookingType.WEEKLY,
    status: BOOKING_STATUS_TYPE.BOOKED,
    hasPassedQuestionnaire: null
};

export const mockBookingCustomCreateRequest: BookingCustomCreateRequest = {
    dateFrom: (moment(new Date()).utc().format("YYYY-MM-DD") as unknown) as string,
    dateTo: (moment(new Date()).utc().format("YYYY-MM-DD") as unknown) as string,
    timeFrom: "10:00 AM",
    timeTo: "12:00 PM",
    location: mockLocation,
    userId: mockUserId,
    deskId: mockDeskEntity.id
};
export const mockBookingDailyCreateRequest: BookingDailyCreateRequest = {
    timeFrom: "10:00 AM",
    timeTo: "12:00 PM",
    location: mockLocation,
    userId: mockUserId,
    deskId: mockDeskEntity.id
};
export const mockBookingWeeklyCreateRequest: BookingWeeklyCreateRequest[] = [
    {
        timeFrom: "10:00 AM",
        timeTo: "12:00 PM",
        location: mockLocation,
        userId: mockUserId,
        deskId: mockDeskEntity.id,
        index: 1,
        selected: true,
        weekDay: "Mon"
    }
];
export const mockDeskApprovers: DeskApproverEntity[] = [
    {
        deskId: "desk_id",
        desk: mockDeskEntity,
        confirmed: true,
        email: "test@test.com",
        sort: 1
    }
];
export const mockEmptyDisabledDays: string[] = [];

export const mockBookingPaginationEntity: BookingPagination = {
    totalCount: 1,
    page: 1,
    limit: 100,
    bookings: [mockCustomBookingEntity, mockDailyBookingEntity, mockWeeklyBookingEntity]
};
