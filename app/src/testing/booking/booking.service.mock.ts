import { IBookingService } from "../../booking-service/IBookingService";

export const mockBookingService = (): IBookingService => ({
    createCustomBooking: jest.fn(),
    getBookings: jest.fn(),
    createDailyBooking: jest.fn(),
    createWeeklyBooking: jest.fn(),
    getBookedTimeSlotsByDeskIdAndMonth: jest.fn(),
    getBookingById: jest.fn(),
    cancelBooking: jest.fn(),
    getBookingDatesByLocationId: jest.fn(),
    getBookingUserIdsByDateRange: jest.fn(),
    getBookingUserIdsByLocationId: jest.fn(),
    updateBookingQuestionnaireStatus: jest.fn(),
    getQuestionnaireBookings: jest.fn(),
    confirmBooking: jest.fn(),
    createBookingBasedOnDeskStatus: jest.fn()
});
