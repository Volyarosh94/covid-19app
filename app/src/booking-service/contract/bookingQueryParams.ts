import { BookingOrderType } from "./bookingOrderType";

export class BookingQueryParams {
    page?: number;
    limit?: number;
    locationId?: string;
    order?: BookingOrderType;
    dateFrom?: Date;
}
