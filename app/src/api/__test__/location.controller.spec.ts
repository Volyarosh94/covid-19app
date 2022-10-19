import * as uuid from "uuid";
import { IDeskService } from "../../desk-service/IDeskService";
import { LocationSitPlaceType } from "../../location-service/contract/locationSitPlaceType";
import { ILocationService } from "../../location-service/ILocationService";
import { mockDeskService } from "../../testing/desk/desk.service.mock";
import { mockLocationService } from "../../testing/location/location.service.mock";
import { LocationController } from "../controllers/location.controller";
import { LocationPresentationMapper } from "../mappers/locationPresentation.mapper";

describe("Location Controller", () => {
    let locationService: ILocationService;
    let controller: LocationController;
    let mapper: LocationPresentationMapper;
    let deskService: IDeskService;

    beforeEach(() => {
        jest.clearAllMocks();

        mapper = new LocationPresentationMapper();
        locationService = mockLocationService();
        deskService = mockDeskService();
        controller = new LocationController(locationService, mapper, deskService);
    });

    describe("getAll", () => {
        it("should return an array of locations", async () => {
            const location = {
                id: uuid.v4(),
                locationName: "locationName",
                locationAddress: "locationName",
                businessHours: "00:00:00 - 24:00:00",
                country: "england",
                city: "portsmouth",
                region: "europe",
                timezone: "+0"
            };

            const getAllSpy = jest
                .spyOn(locationService, "getLocations")
                .mockImplementationOnce(() => Promise.resolve([location]));
            const result = await controller.getAll();

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            expect(result).toMatchObject([location]);
            expect(getAllSpy).toHaveBeenCalled();
        });
    });

    describe("getLocationFloors", () => {
        it("should return an array of location floors without filters", async () => {
            const locationId = uuid.v4();
            const floorId = uuid.v4();
            const floorWithDesksAndSitsTotalCount = {
                id: floorId,
                floorName: "floorName",
                sitDesks: 3,
                sits: 2,
                location: {
                    id: locationId,
                    locationName: "location_1",
                    locationAddress: "address_1",
                    businessHours: "00:00:00 - 24:00:00",
                    country: "england",
                    city: "portsmouth",
                    region: "europe",
                    timezone: "+0"
                }
            };

            const getFloorsSpy = jest
                .spyOn(locationService, "getLocationFloorsWithAvailableDesksCount")
                .mockResolvedValueOnce([floorWithDesksAndSitsTotalCount]);

            await controller.getLocationFloors(locationId);

            expect(getFloorsSpy).toHaveBeenCalledWith(locationId, undefined);
        });

        it("should return an array of location floors with sit desk sit place", async () => {
            const locationId = uuid.v4();
            const floorId = uuid.v4();
            const floorWithDesksAndSitsTotalCount = {
                id: floorId,
                floorName: "floorName",
                sitDesks: 3,
                sits: 2,
                location: {
                    id: locationId,
                    locationName: "location_1",
                    locationAddress: "address_1",
                    businessHours: "00:00:00 - 24:00:00",
                    country: "england",
                    city: "portsmouth",
                    region: "europe",
                    timezone: "+0"
                }
            };

            const getFloorsSpy = jest
                .spyOn(locationService, "getLocationFloorsWithAvailableDesksCount")
                .mockResolvedValueOnce([floorWithDesksAndSitsTotalCount]);

            await controller.getLocationFloors(locationId, {
                sitPlaceType: [LocationSitPlaceType.SIT_DESK]
            });

            expect(getFloorsSpy).toHaveBeenCalledWith(locationId, {
                sitPlaceType: [LocationSitPlaceType.SIT_DESK]
            });
        });
    });

    describe("getLocationById", () => {
        it("should return a location", async () => {
            const locationId = uuid.v4();
            const location = {
                id: locationId,
                locationName: "locationName",
                locationAddress: "locationName",
                businessHours: "00:00:00 - 24:00:00",
                country: "england",
                city: "portsmouth",
                region: "europe",
                timezone: "+0"
            };

            const getLocationSpy = jest
                .spyOn(locationService, "getLocationById")
                .mockImplementationOnce(() => Promise.resolve(location));
            const result = await controller.getLocationById(locationId);

            expect(result).toMatchObject(location);
            expect(getLocationSpy).toHaveBeenCalledWith(locationId);
        });
    });
});
