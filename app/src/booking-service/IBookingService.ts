import { BookingCustomCreateRequest } from "./contract/bookingCustomCreateRequest";
import { BookingCustomDateTimeSlot } from "./contract/bookingCustomDateTimeSlot";
import { BookingDailyCreateRequest } from "./contract/bookingDailyCreateRequest";
import { BookingIdWithDate } from "./contract/bookingIdwithDate";
import { BookingPagination } from "./contract/bookingPagination";
import { BookingQueryParams } from "./contract/bookingQueryParams";
import { BookingWeeklyCreateRequest } from "./contract/bookingWeeklyCreateRequest";
import { QuestionnaireBooking } from "./contract/questionnaireBooking";
import { BookingEntity } from "./entity/booking.entity";

export interface IBookingService {
    createCustomBooking(request: BookingCustomCreateRequest): Promise<BookingEntity[]>;
    createDailyBooking(request: BookingDailyCreateRequest): Promise<BookingEntity[]>;
    createWeeklyBooking(request: BookingWeeklyCreateRequest[]): Promise<BookingEntity[]>;
    getBookings(userId: string, params?: BookingQueryParams): Promise<BookingPagination>;
    getBookedTimeSlotsByDeskIdAndMonth(deskId: string, monthNumber: number): Promise<BookingCustomDateTimeSlot[]>;
    getBookingById(bookingId: string): Promise<BookingEntity>;
    cancelBooking(bookingId: string): Promise<void>;
    getBookingDatesByLocationId(locationId: string): Promise<BookingIdWithDate[]>;
    getBookingUserIdsByLocationId(locationId: string): Promise<string[]>;
    getBookingUserIdsByDateRange(locationId: string, startDate: Date, endDate: Date): Promise<string[]>;
    updateBookingQuestionnaireStatus(bookingId: string, hasPassedQuestionnaire: boolean): Promise<void>;
    getQuestionnaireBookings(userId: string): Promise<QuestionnaireBooking[]>;
    confirmBooking(token: string): Promise<BookingEntity>;
    createBookingBasedOnDeskStatus(bookingEntity: Partial<BookingEntity>): Promise<Partial<BookingEntity>>;
}
