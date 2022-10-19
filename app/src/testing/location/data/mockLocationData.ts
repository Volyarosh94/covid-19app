import { FloorPresentation } from "../../../api/dto/location/floorPresentation.dto";
import { LocationPresentation } from "../../../api/dto/location/locationPresentation.dto";
import { LocationEntity } from "../../../location-service/entity/location.entity";
import { LocationFloorEntity } from "../../../location-service/entity/locationFloor.entity";

export const createMockLocation = (): LocationPresentation => {
    return {
        id: "location_id",
        locationName: "location_1",
        locationAddress: "location_address_1",
        businessHours: "00:00:00 - 24:00:00",
        country: "england",
        city: "portsmouth",
        region: "europe",
        timezone: "Asia/Dubai"
    };
};

export const createMockLocationEntity = (): LocationEntity => {
    return {
        id: "location_id",
        locationName: "location_1",
        locationAddress: "location_address_1",
        businessHours: "00:00:00 - 24:00:00",
        country: "england",
        city: "portsmouth",
        region: "europe",
        timezone: "Asia/Dubai"
    };
};

export const createMockFloor = (): FloorPresentation => ({
    id: "floor_id",
    floorName: "Floor_1",
    locationId: createMockLocation().id
});

export const createMockFloorEntity = (): LocationFloorEntity => ({
    id: "floor_id",
    floorName: "Floor_1",
    location: createMockLocation()
});
