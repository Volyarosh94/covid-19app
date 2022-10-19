import { LocationEntity } from "../../location-service/entity/location.entity";

export interface BookingWeeklyCreateRequest {
    weekDay: string;
    selected: boolean;
    index: number;
    timeFrom: string;
    timeTo: string;
    userId: string;
    location: LocationEntity;
    deskId: string;
}
