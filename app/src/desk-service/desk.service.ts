import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as _ from "lodash";
import * as moment from "moment";
import { Brackets, In, Not, Repository, SelectQueryBuilder } from "typeorm";
import { BOOKING_STATUS_TYPE } from "../booking-service/contract/bookingStatusType";
import { BookingEntity } from "../booking-service/entity/booking.entity";
import { LocationFloorEntity } from "../location-service/entity/locationFloor.entity";
import { ILocationService } from "../location-service/ILocationService";
import { LOCATION_SERVICE } from "../location-service/ioc";
import { INotificationService } from "../notification-service/INotificationService";
import { NOTIFICATION_SERVICE } from "../notification-service/ioc";
import { RESOURCE_SERVICE } from "../resource-service/ioc";
import { IResourceService } from "../resource-service/IResourceService";
import { SectionNeighbour } from "../user-service/contract/sectionNeighbour";
import { UserEntity } from "../user-service/entity/user.entity";
import { convertTimeToDate } from "../utils/util";
import { DeskCreateOrUpdateRequest } from "./contract/deskCreateOrUpdateRequest";
import { DeskQueryParams } from "./contract/deskQueryParams";
import { SavedDeskCreateRequest } from "./contract/deskSavedCreateRequest";
import { DeskMapper } from "./desk.mapper";
import { DeskEntity } from "./entity/desk.entity";
import { DeskApproverEntity } from "./entity/deskApprover.entity";
import { DeskResourceEntity } from "./entity/deskResource.entity";
import { SavedDeskEntity } from "./entity/savedDesk.entity";
import { DeskNotFoundException } from "./exceptions/deskNotFoundException";
import { IDeskService } from "./IDeskService";

@Injectable()
export class DeskService implements IDeskService {
    constructor(
        @InjectRepository(DeskEntity)
        private readonly deskRepository: Repository<DeskEntity>,
        private readonly mapper: DeskMapper,
        @Inject(LOCATION_SERVICE)
        private readonly locationService: ILocationService,
        @Inject(RESOURCE_SERVICE)
        private readonly resourceService: IResourceService,
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: INotificationService,
        @InjectRepository(DeskResourceEntity)
        private readonly deskResourceRepository: Repository<DeskResourceEntity>,
        @InjectRepository(SavedDeskEntity)
        private readonly savedDeskRepository: Repository<SavedDeskEntity>,
        @InjectRepository(DeskApproverEntity)
        private readonly deskApproverRepository: Repository<DeskApproverEntity>,
        private readonly jwtService: JwtService
    ) {}

    async insertOrUpdateDesk(floorId: string, { emails, ...body }: DeskCreateOrUpdateRequest): Promise<DeskEntity> {
        let desk = this.deskRepository.create(body);
        const [resources, floor] = await Promise.all([
            Promise.all(body.resourceIds.map((resourceId) => this.resourceService.getResourceById(resourceId))),
            this.locationService.getLocationFloor(floorId)
        ]);

        desk.floor = floor;
        const [, deskResources] = await Promise.all([
            await this.deskRepository.save(desk),
            Promise.all(
                resources.map((item) => {
                    const deskResource = this.deskResourceRepository.create();
                    deskResource.desk = desk;
                    deskResource.resource = item;
                    return this.deskResourceRepository.save(deskResource);
                })
            )
        ]);
        desk.deskResources = deskResources;

        desk = await this.deskRepository.save(desk);
        await this.saveEmails(desk, emails || []);
        return desk;
    }

    async getDeskById(deskId: string): Promise<DeskEntity> {
        const entity = await this.deskRepository.findOne(deskId, {
            relations: ["floor", "deskResources", "deskResources.resource", "deskResources.resource.location"]
        });
        return entity ? entity : null;
    }

    async getFloorDesks(floorId: string): Promise<DeskEntity[]> {
        return this.deskRepository.find({
            where: { floor: floorId },
            relations: ["floor", "deskResources", "deskResources.resource", "deskResources.resource.location"]
        });
    }

    async removeDesk(deskId: string): Promise<void> {
        await this.deskRepository.delete(deskId);
    }

    async getAvailableDesksByDateTime(floorId: string, params: DeskQueryParams): Promise<DeskEntity[]> {
        const { custom, daily, weekly } = params;

        let qBuilder = this.deskRepository
            .createQueryBuilder("desk")
            .leftJoinAndMapOne("desk.floor", LocationFloorEntity, "floor", "desk.floorId = floor.id")
            .leftJoinAndMapMany("desk.bookings", BookingEntity, "booking", "desk.id = booking.deskId")
            .leftJoinAndMapMany(
                "desk.deskResources",
                DeskResourceEntity,
                "deskResources",
                "deskResources.deskId = desk.id"
            )
            .leftJoinAndSelect("deskResources.resource", "resource")
            .leftJoinAndSelect("resource.location", "location")
            .where("desk.floorId = :floorId", { floorId });

        if (custom) {
            const { dateFrom, dateTo, timeFrom, timeTo } = custom;
            const startDate = moment(dateFrom).startOf("day").format("YYYY-MM-DD HH:mm:ssZ");
            const endDate = moment(dateTo).endOf("day").format("YYYY-MM-DD HH:mm:ssZ");
            const startTime = convertTimeToDate(timeFrom).format("HH:mm:Z");
            const endTime = convertTimeToDate(timeTo).format("HH:mm:Z");

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

        return qBuilder.getMany();
    }

    async addDeskToSaved(request: SavedDeskCreateRequest): Promise<SavedDeskEntity> {
        const [location, floor, desk] = await Promise.all([
            this.locationService.getLocationById(request.locationId),
            this.locationService.getLocationFloor(request.floorId),
            this.getDeskById(request.deskId)
        ]);

        if (!desk) {
            throw new DeskNotFoundException(request.deskId);
        }

        await this.savedDeskRepository.save(new SavedDeskEntity({ location, floor, userId: request.userId, desk }));
        return this.getSavedDeskByDeskId(request.deskId, request.userId);
    }

    async getSavedDeskByDeskId(deskId: string, userId: string): Promise<SavedDeskEntity> {
        const entity = await this.savedDeskRepository.findOne({
            where: { desk: deskId, userId },
            relations: [
                "location",
                "floor",
                "desk",
                "desk.deskResources",
                "desk.deskResources.resource",
                "desk.deskResources.resource.location"
            ]
        });
        return entity;
    }

    async getSavedDesks(userId: string): Promise<SavedDeskEntity[]> {
        return this.savedDeskRepository.find({
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
    }

    async removeSavedDesk(deskId: string, userId: string): Promise<void> {
        await this.savedDeskRepository.delete({ desk: { id: deskId }, userId });
    }

    public async getSectionNeighbours(sectionId: number, query: DeskQueryParams): Promise<SectionNeighbour[]> {
        const { custom, daily, weekly } = query;

        let qbuilder = this.deskRepository
            .createQueryBuilder("desk")
            .innerJoinAndMapMany("desk.bookings", BookingEntity, "booking", "desk.id = booking.deskId")
            .innerJoinAndMapOne("booking.user", UserEntity, "user", "booking.userId = user.id")
            .andWhere("booking.status <> :status", { status: BOOKING_STATUS_TYPE.CANCELED })
            .andWhere("desk.sectionId = :sectionId", { sectionId });

        if (custom) {
            const { dateFrom, dateTo, timeFrom, timeTo } = custom;
            const startDate = moment(dateFrom).startOf("day").format("YYYY-MM-DD HH:mm:ssZ");
            const endDate = moment(dateTo).endOf("day").format("YYYY-MM-DD HH:mm:ssZ");
            const startTime = convertTimeToDate(timeFrom).format("HH:mm:Z");
            const endTime = convertTimeToDate(timeTo).format("HH:mm:Z");
            qbuilder = this.neighboursQueryBuilder(
                { startDate, endDate, startTime, endTime, dateFrom, dateTo, timeFrom, timeTo, condition: "andWhere" },
                qbuilder
            );
        }

        if (daily) {
            const { timeFrom, timeTo } = daily;
            const startTime = convertTimeToDate(timeFrom).format("HH:mm:Z");
            const endTime = convertTimeToDate(timeTo).format("HH:mm:Z");
            const startDate = moment().add(1, "days").startOf("day").format("YYYY-MM-DD HH:mm:ssZ");
            const endDate = moment().add(15, "days").endOf("day").format("YYYY-MM-DD HH:mm:ssZ");

            qbuilder = this.neighboursQueryBuilder(
                { startDate, endDate, startTime, endTime, timeFrom, timeTo, condition: "andWhere" },
                qbuilder
            );
        }

        if (!!weekly?.length) {
            weekly.forEach((w) => {
                const { weekDay, timeFrom, timeTo } = w;
                const startTime = convertTimeToDate(timeFrom).format("HH:mm:Z");
                const endTime = convertTimeToDate(timeTo).format("HH:mm:Z");
                const startDate = moment().add(1, "days").startOf("day").format("YYYY-MM-DD HH:mm:ssZ");
                const endDate = moment().add(15, "days").endOf("day").format("YYYY-MM-DD HH:mm:ssZ");

                qbuilder = this.neighboursQueryBuilder(
                    { startDate, endDate, startTime, endTime, timeFrom, timeTo, weekDay, condition: "orWhere" },
                    qbuilder
                );
            });
        }

        const entities = await qbuilder.getMany();

        const data = entities.map((item) => {
            [].concat(...item.bookings).forEach((el) => (el.deskId = item.id));
            return item.bookings;
        });

        const bookings = _.flatten(data.map((item) => [].concat(...item)));
        return _.uniqWith(
            bookings.map((item) => this.mapper.mapFromUserEntityToUserNeighbour(item, sectionId)),
            _.isEqual
        );
    }

    private neighboursQueryBuilder(
        params: {
            startDate: string;
            endDate: string;
            startTime: string;
            endTime: string;
            dateFrom?: string;
            dateTo?: string;
            timeFrom?: string;
            timeTo?: string;
            weekDay?: string;
            condition: "andWhere" | "orWhere";
        },
        qbuilder: SelectQueryBuilder<DeskEntity>
    ): SelectQueryBuilder<DeskEntity> {
        return qbuilder[params.condition](
            new Brackets((qb) => {
                qb.andWhere(
                    new Brackets((qb) => {
                        qb.orWhere("booking.dateFrom BETWEEN :startDate AND :endDate", {
                            startDate: params.startDate,
                            endDate: params.endDate
                        });
                        qb.orWhere("booking.dateTo BETWEEN :startDate AND :endDate", {
                            startDate: params.startDate,
                            endDate: params.endDate
                        });
                    })
                );

                if (params.weekDay) {
                    qb.andWhere("booking.weekDay = :weekDay ", {
                        weekDay: params.weekDay
                    });
                }
                if (params.timeFrom && params.timeTo) {
                    qb.andWhere(
                        new Brackets((qb) => {
                            qb.orWhere("booking.timeFrom BETWEEN :startTime AND :endTime", {
                                startTime: params.startTime,
                                endTime: params.endTime
                            });
                            qb.orWhere("booking.timeTo BETWEEN :startTime AND :endTime", {
                                startTime: params.startTime,
                                endTime: params.endTime
                            });
                        })
                    );
                }
            })
        );
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
        qbuilder: SelectQueryBuilder<DeskEntity>
    ): SelectQueryBuilder<DeskEntity> {
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

    public async confirmApproverEmail(token: string): Promise<DeskApproverEntity> {
        const data = this.parseApproveConfirmationToken(token);
        const { deskId, email } = data as Partial<DeskApproverEntity>;

        return this.deskApproverRepository.save(
            new DeskApproverEntity({
                deskId,
                email,
                confirmed: true
            })
        );
    }

    public async getApprovers(deskId: string): Promise<DeskApproverEntity[]> {
        return this.deskApproverRepository.find({
            where: {
                deskId,
                confirmed: true
            },
            order: {
                sort: "ASC"
            }
        });
    }

    private async saveEmails(desk: DeskEntity, emails: string[]) {
        await this.deskApproverRepository
            .createQueryBuilder()
            .delete()
            .where({
                deskId: desk.id,
                email: Not(In(emails))
            })
            .execute();
        const results = await Promise.all(
            emails.map((email, index) =>
                this.deskApproverRepository
                    .createQueryBuilder()
                    .insert()
                    .values({
                        deskId: desk.id,
                        email,
                        confirmed: false,
                        sort: index
                    })
                    .onConflict("(\"deskId\", \"email\") DO NOTHING")
                    .execute()
            )
        );
        return Promise.all(
            results.map((result, index) => {
                if (result.raw.length) {
                    return this.notificationService.sendDeskApproverConfirmationEmail({
                        email: emails[index],
                        desk,
                        token: this.generateApproveConfirmation(desk, emails[index])
                    });
                } else {
                    return Promise.resolve();
                }
            })
        );
    }

    private generateApproveConfirmation(desk: DeskEntity, email: string) {
        return this.jwtService.sign(
            {
                deskId: desk.id,
                email
            },
            {
                expiresIn: "999d"
            }
        );
    }

    private parseApproveConfirmationToken(token: string) {
        return this.jwtService.decode(token);
    }
}
