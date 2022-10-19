import { DisabledAndReservedDates } from "./contract/disabledAndReservedDates";

export interface ICalendarService {
    getReservedAndDisabledDates(locationId: string): Promise<DisabledAndReservedDates>;
    addOrUpdateDisabledDates(locationId: string, disabledDays: string[]): Promise<DisabledAndReservedDates>;
    getDisabledDates(locationId: string): Promise<string[]>
}
