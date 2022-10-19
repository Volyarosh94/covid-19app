import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as moment from "moment";
import { BOOKING_STATUS_TYPE } from "../../booking-service/contract/bookingStatusType";
import { BookingEntity } from "../../booking-service/entity/booking.entity";
import { DrawingType } from "../../location-service/contract/floorSchema";
import { ILocationService } from "../../location-service/ILocationService";
import { LOCATION_SERVICE } from "../../location-service/ioc";
import { NOTIFICATION_SERVICE } from "../../notification-service/ioc";
import { RESOURCE_SERVICE } from "../../resource-service/ioc";
import { IResourceService } from "../../resource-service/IResourceService";
import { createMockDeskEntity, createMockDeskJoinedWithBookingEntity } from "../../testing/desk/data/mock.desk.data";
import { mockJWTService } from "../../testing/jwt.service.mock";
import { createMockFloorEntity, createMockLocation } from "../../testing/location/data/mockLocationData";
import { mockLocationService } from "../../testing/location/location.service.mock";
import { mockNotificationService } from "../../testing/notification.service.mock";
import { IMockRepository, mockRepository } from "../../testing/repository.mock";
import { mockResourceService } from "../../testing/resource.service.mock";
import { UserEntity } from "../../user-service/entity/user.entity";
import { DESK_STATUS_TYPE } from "../contract/deskStatusType";
import { DeskMapper } from "../desk.mapper";
import { DeskService } from "../desk.service";
import { DeskEntity } from "../entity/desk.entity";
import { DeskApproverEntity } from "../entity/deskApprover.entity";
import { DeskResourceEntity } from "../entity/deskResource.entity";
import { SavedDeskEntity } from "../entity/savedDesk.entity";
import { IDeskService } from "../IDeskService";

describe("Desk Service", () => {
    let deskService: IDeskService;
    let deskRepo: IMockRepository;
    let savedDeskRepo: IMockRepository;
    let deskResourceRepo: IMockRepository;
    let locationService: ILocationService;
    let resourceService: IResourceService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module = await Test.createTestingModule({
            providers: [
                DeskService,
                DeskMapper,
                {
                    provide: getRepositoryToken(DeskEntity),
                    useFactory: mockRepository
                },
                {
                    provide: getRepositoryToken(SavedDeskEntity),
                    useFactory: mockRepository
                },
                {
                    provide: getRepositoryToken(DeskApproverEntity),
                    useFactory: mockRepository
                },
                {
                    provide: getRepositoryToken(DeskResourceEntity),
                    useFactory: mockRepository
                },
                {
                    provide: LOCATION_SERVICE,
                    useFactory: mockLocationService
                },
                {
                    provide: RESOURCE_SERVICE,
                    useFactory: mockResourceService
                },
                {
                    provide: NOTIFICATION_SERVICE,
                    useFactory: mockNotificationService
                },
                {
                    provide: JwtService,
                    useFactory: mockJWTService
                }
            ]
        }).compile();

        deskService = module.get(DeskService);
        deskRepo = module.get(getRepositoryToken(DeskEntity));
        savedDeskRepo = module.get(getRepositoryToken(SavedDeskEntity));
        deskResourceRepo = module.get(getRepositoryToken(DeskResourceEntity));

        locationService = module.get(LOCATION_SERVICE);
        resourceService = module.get(RESOURCE_SERVICE);
    });

    const mockFloorEntity = createMockFloorEntity();
    const mockDeskEntity = createMockDeskEntity();
    const mockDeskResourceEntity: DeskResourceEntity = {
        id: "desk_resource_id",
        desk: mockDeskEntity,
        resource: {
            id: "resource_id",
            isAvailable: true,
            location: createMockLocation(),
            name: "Resource_1",
            createdAt: ("2021-05-11" as unknown) as Date
        }
    };
    const mockLocation = createMockLocation();
    const mockFloor = createMockFloorEntity();
    const userId = "userId";

    const mockSavedDeskEntity: SavedDeskEntity = {
        id: "saved_desk_id",
        floor: {
            id: mockFloor.id,
            floorName: mockFloor.floorName,
            location: mockLocation
        },
        location: mockLocation,
        userId,
        desk: mockDeskEntity
    };

    const sectionId = 15;
    const getNeighborsQuery = {
        custom: {
            dateFrom: (moment(new Date()).utc().format("YYYY-MM-DD") as unknown) as string,
            dateTo: (moment(new Date()).utc().format("YYYY-MM-DD") as unknown) as string,
            timeFrom: "10:00:00+00:00",
            timeTo: "12:00:00+00:00"
        },
        daily: {
            timeFrom: "10:00:00+00:00",
            timeTo: "12:00:00+00:00"
        },
        weekly: [
            {
                weekDay: "Mon",
                timeFrom: "10:00:00+00:00",
                timeTo: "12:00:00+00:00"
            }
        ]
    };

    it("should get desk by id", async () => {
        const getSpy = jest.spyOn(deskRepo, "findOne").mockReturnValueOnce(mockDeskEntity);
        const result = await deskService.getDeskById(mockDeskEntity.id);

        expect(result).toMatchObject(mockDeskEntity);
        expect(getSpy).toHaveBeenCalledWith(mockDeskEntity.id, {
            relations: ["floor", "deskResources", "deskResources.resource", "deskResources.resource.location"]
        });
    });

    it("should create a desk with resources", async () => {
        const mockSchema = {
            type: DrawingType.DESK,
            sectionId: 1,
            deskId: "desk_id",
            fill: "color",
            coordinates: [
                {
                    x: 1,
                    y: 2
                }
            ],
            line: "color",
            name: "desk_1"
        };
        const body = {
            id: "desk_id",
            name: "Desk_1",
            sectionId: 2,
            section: "Section 2",
            status: DESK_STATUS_TYPE.AVAILABLE,
            owner: "userId",
            resourceIds: ["resource_id"],
            deskSchema: mockSchema
        };

        deskRepo.create.mockReturnValueOnce(mockDeskEntity);
        deskResourceRepo.create.mockReturnValueOnce(mockDeskResourceEntity);
        deskResourceRepo.save.mockResolvedValueOnce(mockDeskResourceEntity);

        jest.spyOn(resourceService, "getResourceById").mockResolvedValueOnce(mockDeskResourceEntity.resource);
        jest.spyOn(locationService, "getLocationFloor").mockResolvedValueOnce(mockFloorEntity);
        jest.spyOn(deskRepo, "save").mockResolvedValueOnce(mockDeskEntity);

        const saveSpy = jest.spyOn(deskRepo, "save").mockResolvedValueOnce(mockDeskEntity);

        const result = await deskService.insertOrUpdateDesk(mockFloorEntity.id, body);

        expect(result).toMatchObject(mockDeskEntity);
        expect(saveSpy).toHaveBeenCalledWith(mockDeskEntity);
    });

    it("should remove a certain desk by id", async () => {
        deskRepo.find.mockResolvedValueOnce(null);

        await deskService.removeDesk(mockDeskEntity.id);
        const result = await deskService.getDeskById(mockDeskEntity.id);

        expect(result).toBeNull();
    });

    it("should get a certain saved desk by desk id", async () => {
        const getSpy = jest.spyOn(savedDeskRepo, "findOne").mockResolvedValueOnce(mockSavedDeskEntity);

        await deskService.getSavedDeskByDeskId(mockDeskEntity.id, userId);

        expect(getSpy).toHaveBeenCalledWith({
            relations: [
                "location",
                "floor",
                "desk",
                "desk.deskResources",
                "desk.deskResources.resource",
                "desk.deskResources.resource.location"
            ],
            where: { desk: mockDeskEntity.id, userId }
        });
    });

    it("should return null in case if saved desk was not found", async () => {
        const getSpy = jest.spyOn(savedDeskRepo, "findOne").mockResolvedValueOnce(undefined);

        await deskService.getSavedDeskByDeskId(mockDeskEntity.id, userId);

        expect(getSpy).toHaveBeenCalledWith({
            relations: [
                "location",
                "floor",
                "desk",
                "desk.deskResources",
                "desk.deskResources.resource",
                "desk.deskResources.resource.location"
            ],
            where: { desk: mockDeskEntity.id, userId }
        });
    });

    it("should delete saved desk by id", async () => {
        const deleteSpy = savedDeskRepo.delete.mockResolvedValueOnce("");
        await deskService.removeSavedDesk(mockDeskEntity.id, userId);

        expect(deleteSpy).toHaveBeenCalledWith({ desk: { id: "desk_id" }, userId });
    });

    it("should add desk to saved list", async () => {
        const request = {
            locationId: mockLocation.id,
            floorId: mockFloor.id,
            userId,
            deskId: mockDeskEntity.id
        };

        const getLocationSpy = jest.spyOn(locationService, "getLocationById").mockResolvedValueOnce(mockLocation);
        const getFloorSpy = jest.spyOn(locationService, "getLocationFloor").mockResolvedValueOnce(mockFloor);
        const getDeskSpy = jest.spyOn(deskService, "getDeskById").mockResolvedValueOnce(mockDeskEntity);

        const saveSpy = jest.spyOn(savedDeskRepo, "save").mockResolvedValueOnce(mockSavedDeskEntity);

        await deskService.addDeskToSaved(request);

        expect(getLocationSpy).toHaveBeenCalledWith(request.locationId);
        expect(getFloorSpy).toHaveBeenCalledWith(request.floorId);
        expect(getDeskSpy).toHaveBeenCalledWith(request.deskId);
        expect(saveSpy).toHaveBeenCalledWith(
            new SavedDeskEntity({
                desk: mockDeskEntity,
                floor: mockFloorEntity,
                location: mockLocation,
                userId: "userId"
            })
        );
    });

    it("should return list of saved desks", async () => {
        const getSpy = jest.spyOn(savedDeskRepo, "find").mockResolvedValueOnce([mockSavedDeskEntity]);

        await deskService.getSavedDesks(userId);

        expect(getSpy).toHaveBeenCalledWith({
            where: { userId },
            relations: [
                "location",
                "floor",
                "desk",
                "desk.deskResources",
                "desk.deskResources.resource",
                "desk.deskResources.resource.location"
            ]
        });
    });

    it("should return a list of users-neighbours for particular section id and data params", async () => {
        const qBuilder = deskRepo.createQueryBuilder();
        const mockDeskEntity = createMockDeskJoinedWithBookingEntity();

        jest.spyOn(qBuilder, "getMany").mockResolvedValueOnce([mockDeskEntity]);

        await deskService.getSectionNeighbours(sectionId, getNeighborsQuery);

        expect(qBuilder.innerJoinAndMapMany).toHaveBeenCalledWith(
            "desk.bookings",
            BookingEntity,
            "booking",
            "desk.id = booking.deskId"
        );
        expect(qBuilder.innerJoinAndMapOne).toHaveBeenCalledWith(
            "booking.user",
            UserEntity,
            "user",
            "booking.userId = user.id"
        );

        expect(qBuilder.andWhere).toBeCalledWith("booking.status <> :status", { status: BOOKING_STATUS_TYPE.CANCELED });
        expect(qBuilder.andWhere).toBeCalledWith("desk.sectionId = :sectionId", { sectionId });
        expect(qBuilder.getMany).toHaveBeenCalled();
    });
});
