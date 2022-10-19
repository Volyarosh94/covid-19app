import { LocationEntity } from "../../location-service/entity/location.entity";

export interface BookingCustomCreateRequest {
    dateFrom: string;
    dateTo: string;
    timeFrom: string;
    timeTo: string;
    userId: string;
    deskId: string;
    location: LocationEntity;
}
