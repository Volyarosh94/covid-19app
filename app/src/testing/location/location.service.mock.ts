import { ILocationService } from "../../location-service/ILocationService";

export interface IMockLocationService {
    createLocation: jest.Mock;
    addLocationFloor: jest.Mock;
    getLocationFloors: jest.Mock;
    getLocations: jest.Mock;
    getLocationById: jest.Mock;
    getLocationFloor: jest.Mock;
    updateLocation: jest.Mock;
    removeLocation: jest.Mock;
    getDeskById: jest.Mock;
    getSitById: jest.Mock;
    assignSitToUser: jest.Mock;
    getSitsOfSitDesk: jest.Mock;
    getLocationFloorWithDesksAndSits: jest.Mock;
}

export const mockLocationService = (): ILocationService => ({
    createLocation: jest.fn(),
    getAddresses: jest.fn(),
    getFloorByName: jest.fn(),
    addLocationFloor: jest.fn(),
    getLocationFloorsWithAvailableDesksCount: jest.fn(),
    getAdminLocationFloors: jest.fn(),
    getLocations: jest.fn(),
    getLocationById: jest.fn(),
    getLocationFloor: jest.fn(),
    updateLocation: jest.fn(),
    removeLocation: jest.fn(),
    getFloorSchema: jest.fn(),
    updateFloorSchema: jest.fn(),
    removeDeskFromSchema: jest.fn(),
    getFloorMap: jest.fn(),
    removeSectionFromSchema: jest.fn(),
    removeLocationFloor: jest.fn(),
    getLocationsAddresses: jest.fn(),
    updateFloorName: jest.fn()
});
