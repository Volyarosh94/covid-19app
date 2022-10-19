import { File } from "./contract/file";
import { FloorCreateRequest } from "./contract/floorCreateRequest";
import { FloorMapImage } from "./contract/floorMapImage";
import { FloorQueryParams } from "./contract/floorQueryParams";
import { Drawing, FloorSchema } from "./contract/floorSchema";
import { GoogleParsedLocations } from "./contract/googleParsedLocations";
import { LocationCreateRequest } from "./contract/locationCreateRequest";
import { LocationFloorWithDesksCountAdmin } from "./contract/locationFloorWithDesksCountAdmin";
import { LocationFloorWithAvailableDesksCount } from "./contract/locationFloorWithTotalDesksAndSitsCount";
import { LocationUpdateRequest } from "./contract/locationUpdateRequest";
import { LocationEntity } from "./entity/location.entity";
import { LocationFloorEntity } from "./entity/locationFloor.entity";

export interface ILocationService {
    createLocation(request: LocationCreateRequest): Promise<LocationEntity>;
    getAdminLocationFloors(locationId: string): Promise<LocationFloorWithDesksCountAdmin[]>;
    getAddresses(param): Promise<GoogleParsedLocations[]>;
    getFloorByName(locationId: string, floorName: string): Promise<LocationFloorEntity>;
    addLocationFloor(locationId: string, request: FloorCreateRequest, map: File): Promise<LocationFloorEntity>;
    getLocationFloorsWithAvailableDesksCount(
        locationId: string,
        params?: FloorQueryParams
    ): Promise<LocationFloorWithAvailableDesksCount[]>;
    getLocations(): Promise<LocationEntity[]>;
    getLocationById(id: string): Promise<LocationEntity>;
    getLocationFloor(floorId: string): Promise<LocationFloorEntity>;
    updateLocation(id: string, request: LocationUpdateRequest): Promise<LocationEntity>;
    removeLocation(id: string): Promise<string>;
    updateFloorName(floorId: string, floorName: string): Promise<LocationFloorEntity>;
    getFloorSchema(floorId: string): Promise<FloorSchema>;
    updateFloorSchema(floorId: string, deskSchema: Drawing[]): Promise<void>;
    removeDeskFromSchema(floorId: string, deskId: string): Promise<void>;
    getFloorMap(floorId: string): Promise<FloorMapImage>;
    removeSectionFromSchema(floorId: string, sectionId: number): Promise<void>;
    removeLocationFloor(floorId: string): Promise<void>;
    getLocationsAddresses(): Promise<string[]>;
}
