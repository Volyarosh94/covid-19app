import { ICalendarService } from "../calendar-service/ICalendarService";

export const mockCalendarService = (): ICalendarService => ({
    getReservedAndDisabledDates: jest.fn(),
    addOrUpdateDisabledDates: jest.fn(),
    getDisabledDates: jest.fn()
});
