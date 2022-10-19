import { LocationEntity } from "../../location-service/entity/location.entity";

export interface BookingDailyCreateRequest {
    timeFrom: string;
    timeTo: string;
    userId: string;
    deskId: string;
    location: LocationEntity;
}
