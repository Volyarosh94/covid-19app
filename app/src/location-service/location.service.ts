import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as _ from "lodash";
import * as moment from "moment";
import * as request from "request";
import { Brackets, Repository, SelectQueryBuilder } from "typeorm";
import { BookingEntity } from "../booking-service/entity/booking.entity";
import { DESK_STATUS_TYPE } from "../desk-service/contract/deskStatusType";
import { DeskEntity } from "../desk-service/entity/desk.entity";
import { DeskResourceEntity } from "../desk-service/entity/deskResource.entity";
import { RESOURCE_SERVICE } from "../resource-service/ioc";
import { IResourceService } from "../resource-service/IResourceService";
import { convertTimeToDate } from "../utils/util";
import { File } from "./contract/file";
import { FloorCreateRequest } from "./contract/floorCreateRequest";
import { FloorMapImage } from "./contract/floorMapImage";
import { FloorQueryParams } from "./contract/floorQueryParams";
import { Drawing, DrawingType, FloorSchema } from "./contract/floorSchema";
import { GoogleLocations } from "./contract/googleLocations";
import { GoogleParsedLocations } from "./contract/googleParsedLocations";
import { LocationCreateRequest } from "./contract/locationCreateRequest";
import { LocationFloorWithDesksCountAdmin } from "./contract/locationFloorWithDesksCountAdmin";
import { LocationFloorWithAvailableDesksCount } from "./contract/locationFloorWithTotalDesksAndSitsCount";
import { LocationUpdateRequest } from "./contract/locationUpdateRequest";
import { FloorMapEntity } from "./entity/floorMap.entity";
import { FloorSchemaEntity } from "./entity/floorSchema.entity";
import { LocationEntity } from "./entity/location.entity";
import { LocationFloorEntity } from "./entity/locationFloor.entity";
import { GoogleAutocompleteParseDataMappers } from "./googleMapsUtils/googleAutocompleteParseData.mappers";
import { ILocationService } from "./ILocationService";
import { LocationMapper } from "./location.mapper";

@Injectable()
export class LocationService implements ILocationService {
    constructor(
        @InjectRepository(LocationEntity)
        private readonly locationRepository: Repository<LocationEntity>,
        @InjectRepository(LocationFloorEntity)
        private readonly floorRepository: Repository<LocationFloorEntity>,
        private readonly mapper: LocationMapper,
        @InjectRepository(FloorSchemaEntity)
        private readonly floorSchemaRepository: Repository<FloorSchemaEntity>,
        @InjectRepository(FloorMapEntity)
        private readonly floorMapRepository: Repository<FloorMapEntity>,
        private readonly googleMapper: GoogleAutocompleteParseDataMappers,
        @Inject(RESOURCE_SERVICE)
        private readonly resourceService: IResourceService
    ) {}

    async createLocation(request: LocationCreateRequest): Promise<LocationEntity> {
        const createdLocation = await this.locationRepository.save(this.mapper.mapCreateRequestToEntity(request));
        this.resourceService.addDefaultResources(createdLocation.id);
        return createdLocation;

    }

    async getAddresses(query: string): Promise<GoogleParsedLocations[]> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (!query.trim().length) {
            return [];
        }
        const regexp = /^[a-z0-9 .!@$%^&*()_+-=\\]+$/i;
        if (!regexp.test(query)) {
            throw new BadRequestException("Entered invalid characters.");
        }
        const basePlacesAutocompleteUrl = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
        const places: Promise<GoogleLocations[]> = new Promise((resolve, reject) => {
            try {
                request.get(
                    `${basePlacesAutocompleteUrl}?input=
                    ${encodeURIComponent(query)}&language=en&key=
                    ${process.env.GOOGLE_MAPS_API_KEY}`,
                    (err, _, buffer) => {
                        if (err) {
                            reject(err);
                        }
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        resolve(JSON.parse(buffer.toString()).predictions);
                    }
                );
            } catch (e) {
                reject(e);
            }
        });
        const restructuredPlaces = await this.googleMapper.getPlacesIds(places);

        const parseData = this.googleMapper.getParseData(restructuredPlaces);

        return parseData;
    }

    async getFloorByName(locationId: string, floorName: string): Promise<LocationFloorEntity> {
        const entity = await this.floorRepository.findOne({
            where: { location: locationId, floorName: floorName },
            relations: ["location"]
        });

        return entity ? entity : null;
    }

    async addLocationFloor(locationId: string, request: FloorCreateRequest, map: File): Promise<LocationFloorEntity> {
        const location = await this.locationRepository.findOne(locationId);
        const { floorName, mapSize } = request;

        if (!location) {
            return null;
        }

        const floor = this.floorRepository.create({ floorName });
        floor.location = location;

        const createdFloor = await this.floorRepository.save(floor);

        await Promise.all([
            this.floorMapRepository.save(this.mapper.mapToFloorMapImageEntity(map, floor)),
            this.floorSchemaRepository.save(this.mapper.mapToFloorSchemaEntity(floor, mapSize))
        ]);

        return createdFloor;
    }

    async getLocationFloor(floorId: string): Promise<LocationFloorEntity> {
        const entity = await this.floorRepository.findOne(floorId, { relations: ["location"] });
        return entity ? entity : null;
    }

    async getAdminLocationFloors(locationId: string): Promise<LocationFloorWithDesksCountAdmin[]> {
        let qBuilder = this.floorRepository
            .createQueryBuilder("floor")
            .where("floor.locationId = :locationId", { locationId })
            .leftJoinAndMapMany("floor.desks", DeskEntity, "desk", "desk.floorId = floor.id");

        const entities = await qBuilder.getMany();
        return entities.map(this.mapper.mapToFloorWithSitsCountAdmin);
    }

    async getLocationFloorsWithAvailableDesksCount(
        locationId: string,
        params?: FloorQueryParams
    ): Promise<LocationFloorWithAvailableDesksCount[]> {
        let qBuilder = this.floorRepository
            .createQueryBuilder("floor")
            .where("floor.locationId = :locationId", { locationId })
            .leftJoinAndMapOne("floor.location", LocationEntity, "location", "floor.locationId = location.id")
            .leftJoinAndMapMany("floor.desks", DeskEntity, "desk", "floor.id = desk.floorId")
            .andWhere("desk.id is not null")
            .andWhere("desk.status != :status", { status: DESK_STATUS_TYPE.UNAVAILABLE });

        if (_.isEmpty(params)) {
            const entities = await qBuilder.getMany();
            return entities.map((item) => this.mapper.mapToFloorWithAvailableDesksCount(item));
        } else {
            const { custom, daily, weekly } = params;


            qBuilder = qBuilder
                .leftJoinAndMapMany(
                    "desk.deskResources",
                    DeskResourceEntity,
                    "deskResources",
                    "deskResources.deskId = desk.id"
                )
                .leftJoinAndSelect("deskResources.resource", "resource")
                .leftJoinAndMapMany("desk.bookings", BookingEntity, "booking", "desk.id = booking.deskId");


            if (custom) {
                const { dateFrom, dateTo, timeFrom, timeTo } = custom;
                const startDate = moment(dateFrom).startOf("day").format("YYYY-MM-DD HH:mm:ssZ");
                const endDate = moment(dateTo).endOf("day").format("YYYY-MM-DD HH:mm:ssZ");
                const startTime = convertTimeToDate(timeFrom).format("HH:mm:ssZ");
                const endTime = convertTimeToDate(timeTo).format("HH:mm:ssZ");

                qBuilder = this.availableDesksByDateTimeQueryBuilder(
                    { startDate, endDate, startTime, endTime, timeFrom, timeTo },
                    qBuilder
                );
            }

            if (daily) {
                const { timeFrom, timeTo } = daily;
                const startTime = convertTimeToDate(timeFrom).format("HH:mm:Z");
                const endTime = convertTimeToDate(timeTo).format("HH:mm:Z");
                const startDate = moment().startOf("day").format("YYYY-MM-DD HH:mm:ssZ");
                const endDate = moment().endOf("day").format("YYYY-MM-DD HH:mm:ssZ");

                qBuilder = qBuilder = this.availableDesksByDateTimeQueryBuilder(
                    { startDate, endDate, startTime, endTime, timeFrom, timeTo },
                    qBuilder
                );
            }

            if (!!weekly?.length) {
                weekly.forEach((w) => {
                    const { weekDay, timeFrom, timeTo } = w;
                    const startTime = convertTimeToDate(timeFrom).format("HH:mm:Z");
                    const endTime = convertTimeToDate(timeTo).format("HH:mm:Z");
                    const startDate = moment().startOf("day").format("YYYY-MM-DD HH:mm:ssZ");
                    const endDate = moment().endOf("day").format("YYYY-MM-DD HH:mm:ssZ");

                    qBuilder = qBuilder = qBuilder = this.availableDesksByDateTimeQueryBuilder(
                        { startDate, endDate, startTime, endTime, timeFrom, timeTo, weekDay },
                        qBuilder
                    );
                });
            }

            const entities = await qBuilder.getMany();
            return entities
                .map((item) => this.mapper.mapToFloorWithAvailableDesksCount(item, params))
                .filter((item) => item.sitDesks); // return floors which has at least one available desk
        }
    }

    async getLocations(): Promise<LocationEntity[]> {
        return this.locationRepository.find({
            relations: ["floorsEntity", "floorsEntity.desks"],
            order: {
                createdAt: "ASC"
            }
        });
    }

    async getLocationById(id: string): Promise<LocationEntity> {
        const entity = await this.locationRepository.findOne(id, {
            relations: ["floorsEntity", "floorsEntity.desks"]
        });
        return entity ? entity : null;
    }

    async updateLocation(id: string, request: LocationUpdateRequest): Promise<LocationEntity> {
        await this.locationRepository.update(id, { ...request });
        return this.getLocationById(id);
    }

    async updateFloorName(floorId: string, floorName: string): Promise<LocationFloorEntity> {
        await this.floorRepository.update(floorId, { floorName });
        return this.getLocationFloor(floorId);
    }

    async removeLocation(id: string): Promise<string> {
        await this.locationRepository.delete(id);
        return id;
    }

    async getFloorSchema(floorId: string): Promise<FloorSchema> {
        const entity = await this.floorSchemaRepository.findOne({
            where: { floor: floorId },
            relations: ["floor", "floor.desks", "floor.desks.approvers"]
        });
        return entity ? this.mapper.mapToSchemaContract(entity) : null;
    }

    async updateFloorSchema(floorId: string, drawingSchema: Drawing[]): Promise<void> {
        let entity = await this.floorSchemaRepository.findOne({ where: { floor: floorId }, relations: ["floor"] });

        drawingSchema.forEach((schema) => {
            const desk = entity.schema.drawings.find(
                (item) => item.deskId === schema.deskId && item.type === DrawingType.DESK
            );
            const section = entity.schema.drawings.find(
                (item) => item.sectionId === schema.sectionId && item.type === DrawingType.SECTION
            );

            if (schema.type === DrawingType.DESK && desk) {
                entity.schema.drawings.map((item) => (item.deskId === schema.deskId ? _.extend(item, schema) : item));
            } else if (schema.type === DrawingType.SECTION && section) {
                entity.schema.drawings.map((item) =>
                    item.sectionId === schema.sectionId ? _.extend(item, schema) : item
                );
            } else {
                entity.schema.drawings.push(schema);
            }
        });

        await this.floorSchemaRepository.save(entity);
    }

    async removeDeskFromSchema(floorId: string, deskId: string): Promise<void> {
        const entity = await this.floorSchemaRepository.findOne({ where: { floor: floorId }, relations: ["floor"] });
        entity.schema.drawings = entity.schema.drawings.filter((item) => item.deskId !== deskId);
        await this.floorMapRepository.save(entity);
    }

    async getFloorMap(floorId: string): Promise<FloorMapImage> {
        const entity = await this.floorMapRepository.findOne({ where: { floor: floorId }, relations: ["floor"] });
        return entity ? this.mapper.mapToFloorMapImage(entity) : null;
    }

    async removeSectionFromSchema(floorId: string, sectionId: number): Promise<void> {
        const entity = await this.floorSchemaRepository.findOne({ where: { floor: floorId }, relations: ["floor"] });
        entity.schema.drawings = entity.schema.drawings
            .filter((item) => item.type === DrawingType.SECTION && item.sectionId !== sectionId)
            .map((item) => (item.sectionId === sectionId ? { ...item, sectionId: null } : item));
        await this.floorMapRepository.save(entity);
    }

    async removeLocationFloor(floorId: string): Promise<void> {
        await this.floorRepository.delete(floorId);
    }

    async getLocationsAddresses(): Promise<string[]> {
        let entities = await this.locationRepository.find({
            order: {
                createdAt: "ASC"
            }
        });
        return entities.map(this.mapper.mapEntityToLocationAddresses);
    }

    private availableDesksByDateTimeQueryBuilder(
        params: {
            startDate: string;
            endDate: string;
            startTime: string;
            endTime: string;
            timeFrom?: string;
            timeTo?: string;
            weekDay?: string;
        },
        qbuilder: SelectQueryBuilder<LocationFloorEntity>
    ): SelectQueryBuilder<LocationFloorEntity> {
        const { startDate, endDate, timeFrom, timeTo, startTime, endTime, weekDay } = params;
        return qbuilder.andWhere(
            new Brackets((qb) => {
                qb.andWhere("booking.dateFrom BETWEEN :startDate AND :endDate", { startDate, endDate });

                if (timeFrom && timeTo) {
                    qb.andWhere("booking.timeFrom BETWEEN :startTime AND :endTime", {
                        startTime,
                        endTime
                    });
                    qb.andWhere("booking.timeTo BETWEEN :startTime AND :endTime", {
                        startTime,
                        endTime
                    });
                }

                if (weekDay) {
                    qb.orWhere("booking.weekDay = :weekDay ", {
                        weekDay
                    });
                }

                qb.orWhere("booking.dateFrom != :startDate", { startDate });
                qb.orWhere("booking.timeFrom != :startTime", { startTime });
                qb.orWhere("booking.timeTo != :endTime", { endTime });
                qb.orWhere("booking.id is null");
            })
        );
    }
}
