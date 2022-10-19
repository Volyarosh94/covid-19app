import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as uuid from "uuid";
import { DeskEntity } from "../../desk-service/entity/desk.entity";
import { DeskResourceEntity } from "../../desk-service/entity/deskResource.entity";
import { RESOURCE_SERVICE } from "../../resource-service/ioc";
import { IResourceService } from "../../resource-service/IResourceService";
import {
    mockFloorSchemaEntityWithDrawings,
    mockFloorSchemaEntityWithEmptyDrawings
} from "../../testing/location/data/mockFloorSchema";
import {
    createMockFloor,
    createMockFloorEntity,
    createMockLocationEntity
} from "../../testing/location/data/mockLocationData";
import { IMockRepository, mockRepository } from "../../testing/repository.mock";
import { mockResourceService } from "../../testing/resource.service.mock";
import { DrawingType } from "../contract/floorSchema";
import { LocationFloorWithDesksCountAdmin } from "../contract/locationFloorWithDesksCountAdmin";
import { LocationFloorWithAvailableDesksCount } from "../contract/locationFloorWithTotalDesksAndSitsCount";
import { LocationUpdateRequest } from "../contract/locationUpdateRequest";
import { FloorMapEntity } from "../entity/floorMap.entity";
import { FloorSchemaEntity } from "../entity/floorSchema.entity";
import { LocationEntity } from "../entity/location.entity";
import { LocationFloorEntity } from "../entity/locationFloor.entity";
import { GoogleAutocompleteParseDataMappers } from "../googleMapsUtils/googleAutocompleteParseData.mappers";
import { ILocationService } from "../ILocationService";
import { LocationMapper } from "../location.mapper";
import { LocationService } from "../location.service";

describe("LocationService", () => {
    let locationService: ILocationService;
    let locationRepo: IMockRepository;
    let locationFloorRepo: IMockRepository;
    let mapper: LocationMapper;
    let floorSchemaRepo: IMockRepository;
    let floorMapRepo: IMockRepository;
    let resourceService: IResourceService;

    const mockLocation = createMockLocationEntity();
    const mockFloorId = uuid.v4();

    beforeEach(async () => {
        jest.clearAllMocks();

        const module = await Test.createTestingModule({
            providers: [
                LocationService,
                LocationMapper,
                GoogleAutocompleteParseDataMappers,
                {
                    provide: getRepositoryToken(LocationEntity),
                    useFactory: mockRepository
                },
                {
                    provide: getRepositoryToken(LocationFloorEntity),
                    useFactory: mockRepository
                },
                {
                    provide: getRepositoryToken(FloorSchemaEntity),
                    useFactory: mockRepository
                },
                {
                    provide: getRepositoryToken(FloorMapEntity),
                    useFactory: mockRepository
                },
                {
                    provide: RESOURCE_SERVICE,
                    useFactory: mockResourceService
                }
            ]
        }).compile();

        locationService = module.get(LocationService);
        locationRepo = module.get(getRepositoryToken(LocationEntity));
        locationFloorRepo = module.get(getRepositoryToken(LocationFloorEntity));
        floorMapRepo = module.get(getRepositoryToken(FloorMapEntity));
        floorSchemaRepo = module.get(getRepositoryToken(FloorSchemaEntity));
        mapper = module.get(LocationMapper);
        resourceService = module.get(RESOURCE_SERVICE);
    });

    it("should create location with default resources", async () => {
        const request = { ...mockLocation };
        delete request.id;

        const mapSpy = jest.spyOn(mapper, "mapCreateRequestToEntity").mockImplementationOnce(() => mockLocation);
        const saveSpy = locationRepo.save.mockImplementationOnce(() => mockLocation);
        const result = await locationService.createLocation(request);
        const addResourcesSpy = jest.spyOn(resourceService, "addDefaultResources");

        expect(result).toMatchObject(mockLocation);
        expect(saveSpy).toHaveBeenCalledWith(mockLocation);
        expect(addResourcesSpy).toHaveBeenCalledWith(mockLocation.id);
        expect(mapSpy).toHaveReturnedWith(mockLocation);
    });

    it("should get all locations", async () => {
        const getAllSpy = locationRepo.find.mockImplementationOnce(() => [mockLocation]);
        const result = await locationService.getLocations();

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThan(0);
        expect(getAllSpy).toHaveBeenCalled();
    });

    it("should get specific location by id", async () => {
        const finOneSpy = locationRepo.findOne.mockImplementationOnce(() => mockLocation);
        const result = await locationService.getLocationById(mockLocation.id);

        expect(result).toMatchObject(mockLocation);
        expect(finOneSpy).toHaveBeenCalledWith(mockLocation.id, { relations: ["floorsEntity", "floorsEntity.desks"] });
    });

    it("should update location", async () => {
        const request: LocationUpdateRequest = {
            locationName: "location_2"
        };

        locationRepo.findOne.mockResolvedValueOnce({ ...mockLocation, locationName: "location_2" });
        const saveSpy = locationRepo.update.mockResolvedValueOnce({
            ...mockLocation,
            locationName: "location_2"
        });

        const result = await locationService.updateLocation(mockLocation.id, request);

        expect(result.id).toEqual(mockLocation.id);
        expect(result).not.toMatchObject(mockLocation);
        expect(saveSpy).toHaveBeenCalledWith(mockLocation.id, request);
    });

    it("should remove location by id", async () => {
        const deleteSpy = locationRepo.delete.mockImplementationOnce(() => undefined);
        const findSpy = locationRepo.findOne.mockImplementationOnce(() => null);

        await locationService.removeLocation(mockLocation.id);
        const result = await locationService.getLocationById(mockLocation.id);

        expect(result).toBe(null);

        expect(deleteSpy).toHaveReturnedWith(undefined);

        expect(findSpy).toHaveReturnedWith(null);
    });

    it("should return return list of floors with total count of sits and sitDesks", async () => {
        const queryBuilder = locationFloorRepo.createQueryBuilder();
        const mockFloorsWithDesksAndSitsCount: LocationFloorWithAvailableDesksCount = {
            id: uuid.v4(),
            floorName: "floor_1",
            sitDesks: 3,
            location: {
                id: uuid.v4(),
                businessHours: "00:00:00 - 24:00:00",
                locationAddress: "address_1",
                locationName: "location_1",
                country: "england",
                city: "portsmouth",
                region: "europe",
                timezone: "+0"
            }
        };

        const mapSpy = jest
            .spyOn(mapper, "mapToFloorWithAvailableDesksCount")
            .mockImplementationOnce(() => mockFloorsWithDesksAndSitsCount);
        jest.spyOn(queryBuilder, "getMany").mockImplementationOnce(() =>
            Promise.resolve([mockFloorsWithDesksAndSitsCount])
        );

        const result = await locationService.getLocationFloorsWithAvailableDesksCount(mockLocation.id);

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThan(0);
        expect(result).toMatchObject([mockFloorsWithDesksAndSitsCount]);

        expect(queryBuilder.leftJoinAndMapMany).nthCalledWith(
            1,
            "floor.desks",
            DeskEntity,
            "desk",
            "floor.id = desk.floorId"
        );

        expect(queryBuilder.where).nthCalledWith(1, "floor.locationId = :locationId", { locationId: mockLocation.id });
        expect(queryBuilder.andWhere).nthCalledWith(1, "desk.id is not null");
        expect(queryBuilder.getMany).nthCalledWith(1);
        expect(mapSpy).toHaveReturnedWith(mockFloorsWithDesksAndSitsCount);
    });

    it("should return list of floors with total count of total, available and assigned sits for admin", async () => {
        const queryBuilder = locationFloorRepo.createQueryBuilder();
        const mockFloorsWithSitsCountAdmin: LocationFloorWithDesksCountAdmin = {
            id: uuid.v4(),
            floorName: "floor_1",
            totalDesks: 5,
            availableDesks: 3,
            assignedDesks: 2,
            location: {
                id: uuid.v4(),
                businessHours: "00:00:00 - 24:00:00",
                locationAddress: "address_1",
                locationName: "location_1",
                country: "england",
                city: "portsmouth",
                region: "europe",
                timezone: "+0"
            }
        };

        const mapSpy = jest
            .spyOn(mapper, "mapToFloorWithSitsCountAdmin")
            .mockImplementationOnce(() => mockFloorsWithSitsCountAdmin);
        jest.spyOn(queryBuilder, "getMany").mockImplementationOnce(() =>
            Promise.resolve([mockFloorsWithSitsCountAdmin])
        );

        const result = await locationService.getAdminLocationFloors(mockLocation.id);

        expect(mockFloorsWithSitsCountAdmin.totalDesks).toBeGreaterThanOrEqual(
            mockFloorsWithSitsCountAdmin.availableDesks
        );
        expect(mockFloorsWithSitsCountAdmin.totalDesks).toBeGreaterThanOrEqual(
            mockFloorsWithSitsCountAdmin.assignedDesks
        );
        expect(mockFloorsWithSitsCountAdmin.totalDesks).toEqual(
            mockFloorsWithSitsCountAdmin.assignedDesks + mockFloorsWithSitsCountAdmin.availableDesks
        );
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThan(0);
        expect(result).toMatchObject([mockFloorsWithSitsCountAdmin]);

        expect(queryBuilder.leftJoinAndMapMany).nthCalledWith(
            1,
            "floor.desks",
            DeskEntity,
            "desk",
            "desk.floorId = floor.id"
        );

        expect(queryBuilder.where).nthCalledWith(1, "floor.locationId = :locationId", { locationId: mockLocation.id });
        expect(queryBuilder.getMany).nthCalledWith(1);
        expect(mapSpy).toHaveReturnedWith(mockFloorsWithSitsCountAdmin);
    });

    it("should return list of floors with selected resources", async () => {
        const queryBuilder = locationFloorRepo.createQueryBuilder();
        const mockFloorsWithDesksAndSitsCount: LocationFloorWithAvailableDesksCount = {
            id: uuid.v4(),
            floorName: "floor_1",
            sitDesks: 3,
            location: {
                id: "location_id",
                businessHours: "00:00:00 - 24:00:00",
                locationAddress: "address_1",
                locationName: "location_1",
                country: "england",
                city: "portsmouth",
                region: "europe",
                timezone: "+0"
            }
        };
        const query = {
            resources: ["Power cord", "Screens"],
            sitPlaceTye: []
        };

        const mapSpy = jest
            .spyOn(mapper, "mapToFloorWithAvailableDesksCount")
            .mockImplementationOnce(() => mockFloorsWithDesksAndSitsCount);
        jest.spyOn(queryBuilder, "getMany").mockImplementationOnce(() =>
            Promise.resolve([mockFloorsWithDesksAndSitsCount])
        );

        await locationService.getLocationFloorsWithAvailableDesksCount(mockLocation.id, query);

        expect(queryBuilder.leftJoinAndMapMany).nthCalledWith(
            1,
            "floor.desks",
            DeskEntity,
            "desk",
            "floor.id = desk.floorId"
        );

        expect(queryBuilder.leftJoinAndMapMany).toHaveBeenCalledWith(
            "desk.deskResources",
            DeskResourceEntity,
            "deskResources",
            "deskResources.deskId = desk.id"
        );
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith("deskResources.resource", "resource");
        expect(queryBuilder.where).nthCalledWith(1, "floor.locationId = :locationId", { locationId: mockLocation.id });
        expect(queryBuilder.andWhere).nthCalledWith(1, "desk.id is not null");
        expect(queryBuilder.getMany).toHaveBeenCalled();

        [mockFloorsWithDesksAndSitsCount].every((item) => {
            expect(mapSpy).toHaveBeenCalledWith(item, query);
        });
    });

    it("should create floor with floor map and schema", async () => {
        const schemaId = "schema_id";
        const mockFloor = { id: uuid.v4(), floorName: "Floor_1", location: mockLocation };
        const mapImage = {
            buffer: Buffer.from("str"),
            encoding: "encoding",
            fieldname: "map",
            mimetype: "mime",
            originalname: "name",
            size: 123
        };
        const mapSize = {
            width: 100,
            height: 300
        };

        const createMapResult = {
            id: uuid.v4(),
            data: mapImage.buffer,
            mimetype: mapImage.mimetype,
            floor: mockFloor,
            buffer: mapImage.buffer,
            encoding: mapImage.encoding,
            fieldname: mapImage.fieldname,
            originalname: mapImage.originalname,
            size: mapImage.size
        };
        const createSchemaResult = {
            id: schemaId,
            floor: mockFloor,
            schema: {
                id: schemaId,
                drawings: [],
                floorName: mockFloor.floorName,
                floorId: mockFloor.id,
                mapUrl: `/api/locations/${mockFloor.id}/floor-map`,
                size: mapSize
            }
        };

        locationFloorRepo.create.mockReturnValueOnce({ floorName: mockFloor.floorName });
        locationFloorRepo.save.mockResolvedValueOnce({ ...mockFloor, location: mockLocation });
        locationRepo.findOne.mockResolvedValueOnce(mockLocation);

        jest.spyOn(mapper, "mapToFloorMapImageEntity").mockReturnValueOnce(createMapResult);
        jest.spyOn(mapper, "mapToFloorSchemaEntity").mockReturnValueOnce(createSchemaResult);

        const mapCreateSpy = jest.spyOn(floorMapRepo, "save");
        const schemaCreateSpy = jest.spyOn(floorSchemaRepo, "save");

        const result = await locationService.addLocationFloor(
            mockLocation.id,
            { floorName: mockFloor.floorName, mapSize },
            mapImage
        );

        expect(result).toMatchObject(mockFloor);
        expect(mapCreateSpy).toHaveBeenCalledWith(createMapResult);
        expect(schemaCreateSpy).toHaveBeenCalledWith(createSchemaResult);
    });

    it("should update desk in floor schema", async () => {
        const mockFloor = createMockFloorEntity();
        const schemaUpdateBody = [
            {
                deskId: "desk_id",
                coordinates: [
                    {
                        x: 20,
                        y: 20
                    }
                ],
                fill: "color_3",
                line: "color_4",
                name: "Desk 1",
                sectionId: 1,
                type: DrawingType.DESK
            }
        ];

        const saveSpy = jest.spyOn(floorSchemaRepo, "save").mockReturnThis();
        floorSchemaRepo.findOne.mockResolvedValueOnce(mockFloorSchemaEntityWithDrawings);
        await locationService.updateFloorSchema(mockFloor.id, schemaUpdateBody);

        expect(mockFloorSchemaEntityWithDrawings.schema.drawings).toContainEqual(schemaUpdateBody[0]);
        expect(saveSpy).toHaveBeenCalledWith(mockFloorSchemaEntityWithDrawings);
    });

    it("should add new desk into floor schema", async () => {
        const mockFloor = createMockFloorEntity();
        const schemaUpdateBody = [
            {
                deskId: "desk_id",
                coordinates: [
                    {
                        x: 10,
                        y: 15
                    }
                ],
                fill: "color_1",
                line: "color_1",
                name: "Desk 2",
                sectionId: 1,
                type: DrawingType.DESK
            }
        ];

        const saveSpy = jest.spyOn(floorSchemaRepo, "save");
        floorSchemaRepo.findOne.mockResolvedValueOnce(mockFloorSchemaEntityWithDrawings);
        await locationService.updateFloorSchema(mockFloor.id, schemaUpdateBody);

        expect(mockFloorSchemaEntityWithDrawings.schema.drawings).toContainEqual(schemaUpdateBody[0]);
        expect(saveSpy).toHaveBeenCalledWith(mockFloorSchemaEntityWithDrawings);
    });

    it("should get a certain schema of a floor", async () => {
        const mockFloor = createMockFloor();
        const getSpy = jest.spyOn(floorSchemaRepo, "findOne").mockResolvedValueOnce(mockFloorSchemaEntityWithDrawings);
        const schema = await locationService.getFloorSchema(mockFloor.id);

        expect(getSpy).toHaveBeenCalledWith({
            where: { floor: mockFloor.id },
            relations: ["floor", "floor.desks", "floor.desks.approvers"]
        });
        expect(schema).toMatchObject({
            id: mockFloorSchemaEntityWithDrawings.id,
            floorId: mockFloorSchemaEntityWithDrawings.floor.id,
            size: mockFloorSchemaEntityWithDrawings.schema.size,
            drawings: mockFloorSchemaEntityWithDrawings.schema.drawings,
            mapUrl: mockFloorSchemaEntityWithDrawings.schema.mapUrl
        });
    });

    it("should remove desk from floor schema", async () => {
        const mockFloor = createMockFloorEntity();
        const schemaUpdateBody = {
            deskId: "desk_id",
            coordinates: [
                {
                    x: 10,
                    y: 15
                }
            ],
            fill: "color_1",
            line: "color_1",
            name: "Desk 2",
            sectionId: 1,
            type: DrawingType.DESK
        };

        const saveSpy = jest.spyOn(floorSchemaRepo, "save");
        floorSchemaRepo.findOne.mockResolvedValueOnce(mockFloorSchemaEntityWithDrawings);
        await locationService.updateFloorSchema(mockFloor.id, [schemaUpdateBody]);

        const desksCountBeforeRemove = mockFloorSchemaEntityWithDrawings.schema.drawings;

        expect(mockFloorSchemaEntityWithDrawings.schema.drawings).not.toContain(schemaUpdateBody.deskId);
        expect(mockFloorSchemaEntityWithDrawings.schema.drawings.length).not.toEqual(desksCountBeforeRemove);
        expect(saveSpy).toHaveBeenCalledWith(mockFloorSchemaEntityWithDrawings);
    });

    it("should remove section from floor schema", async () => {
        const mockFloor = createMockFloorEntity();
        const section = {
            deskId: null,
            coordinates: [
                {
                    x: 10,
                    y: 15
                }
            ],
            fill: "color_1",
            line: "color_2",
            name: "Section 1",
            sectionId: 1,
            type: DrawingType.SECTION
        };
        const desks = [
            {
                deskId: 1,
                coordinates: [
                    {
                        x: 10,
                        y: 15
                    }
                ],
                fill: "color_1",
                line: "color_2",
                name: "Desk 1",
                sectionId: 1,
                type: DrawingType.DESK
            },
            {
                deskId: 2,
                coordinates: [
                    {
                        x: 10,
                        y: 15
                    }
                ],
                fill: "color_1",
                line: "color_2",
                name: "Desk 1",
                sectionId: 1,
                type: DrawingType.DESK
            }
        ];

        mockFloorSchemaEntityWithEmptyDrawings.schema.drawings = [section, ...desks];
        floorSchemaRepo.findOne.mockResolvedValueOnce(mockFloorSchemaEntityWithEmptyDrawings);

        await locationService.removeSectionFromSchema(mockFloor.id, section.sectionId);

        expect(mockFloorSchemaEntityWithEmptyDrawings.schema.drawings).not.toContain(section);

        mockFloorSchemaEntityWithEmptyDrawings.schema.drawings.every((item) => {
            expect(item.sectionId).toBeNull();
            expect(item.type).toBe(DrawingType.DESK);
        });
    });

    it("should remove floor", async () => {
        const deleteSpy = jest.spyOn(locationFloorRepo, "delete");

        await locationService.removeLocationFloor(mockFloorId);
        expect(deleteSpy).toHaveBeenCalledWith(mockFloorId);
    });
});
