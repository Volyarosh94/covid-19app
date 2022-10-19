import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as _ from "lodash";
import * as moment from "moment-timezone";
import { Between, IsNull, Not, Repository } from "typeorm";
import { CalendarService } from "../calendar-service/calendar.service";
import { ICalendarService } from "../calendar-service/ICalendarService";
import { ICovidQuestionService } from "../covid-question-service/ICovidQuestionService";
import { COVID_QUESTION_SERVICE } from "../covid-question-service/ioc";
import { DESK_STATUS_TYPE } from "../desk-service/contract/deskStatusType";
import { DeskEntity } from "../desk-service/entity/desk.entity";
import { DeskApproverEntity } from "../desk-service/entity/deskApprover.entity";
import { DeskResourceEntity } from "../desk-service/entity/deskResource.entity";
import { DeskNotFoundException } from "../desk-service/exceptions/deskNotFoundException";
import { IDeskService } from "../desk-service/IDeskService";
import { DESK_SERVICE } from "../desk-service/ioc";
import { LocationEntity } from "../location-service/entity/location.entity";
import { LocationFloorEntity } from "../location-service/entity/locationFloor.entity";
import { INotificationService } from "../notification-service/INotificationService";
import { NOTIFICATION_SERVICE } from "../notification-service/ioc";
import { DeviceTokenEntity } from "../user-service/entity/deviceToken.entity";
import { UserEntity } from "../user-service/entity/user.entity";
import { UserNotFountException } from "../user-service/exceptions/userNotFountException";
import { USER_SERVICE } from "../user-service/ioc";
import { IUserService } from "../user-service/IUserService";
import { BookingMapper } from "./booking.mapper";
import { BOOKING_APPROVE_ACTION } from "./contract/bookingApproveAction";
import { BookingCustomCreateRequest } from "./contract/bookingCustomCreateRequest";
import { BookingCustomDateTimeSlot } from "./contract/bookingCustomDateTimeSlot";
import { BookingDailyCreateRequest } from "./contract/bookingDailyCreateRequest";
import { BookingIdWithDate } from "./contract/bookingIdwithDate";
import { BookingOrderType } from "./contract/bookingOrderType";
import { BookingPagination } from "./contract/bookingPagination";
import { BookingQueryParams } from "./contract/bookingQueryParams";
import { BOOKING_STATUS_TYPE } from "./contract/bookingStatusType";
import { BookingType } from "./contract/bookingType";
import { BookingWeeklyCreateRequest } from "./contract/bookingWeeklyCreateRequest";
import { QuestionnaireBooking } from "./contract/questionnaireBooking";
import { BookingEntity } from "./entity/booking.entity";
import { BookingApprovalsEntity } from "./entity/bookingApprovals.entity";
import { IBookingService } from "./IBookingService";
import { BookingValidator } from "./validators/bookingValidator";

@Injectable()
export class BookingService implements IBookingService {
    constructor(
        private readonly mapper: BookingMapper,
        private readonly validator: BookingValidator,
        @Inject(DESK_SERVICE)
        private readonly deskService: IDeskService,
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: INotificationService,
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>,
        @InjectRepository(BookingApprovalsEntity)
        private readonly bookingApprovalsRepository: Repository<BookingApprovalsEntity>,
        @Inject(forwardRef(() => CalendarService))
        private readonly calendarService: ICalendarService,
        @Inject(USER_SERVICE)
        private readonly userService: IUserService,
        @Inject(COVID_QUESTION_SERVICE)
        private readonly covidQuestionService: ICovidQuestionService,
        private readonly jwtService: JwtService
    ) {}

    public async createCustomBooking(request: BookingCustomCreateRequest): Promise<BookingEntity[]> {
        const { dateFrom, dateTo, timeFrom, timeTo, location } = request;
        const [, , , , desk, user] = await Promise.all([
            this.validator.validateBookingStartDate(dateFrom, dateTo),
            this.validator.validateTimeFormat(timeFrom, timeTo),
            this.validator.validateBookingStartTime(timeFrom, timeTo),
            this.validator.validateBookingExistence({
                ..._.omit(request, "deskId", "location"),
                locationId: location.id
            }),
            this.deskService.getDeskById(request.deskId),
            this.userService.getUserById(request.userId)
        ]);

        if (!desk) {
            throw new DeskNotFoundException(request.deskId);
        }

        if (!user) {
            throw new UserNotFountException(request.userId);
        }

        const bookingsToCreate = this.mapper.mapCreateRequestToCustomBookingEntity(request);
        const entities = await Promise.all(
            bookingsToCreate.map(async (entity) => {
                entity.desk = desk;
                entity.location = location;
                entity.user = user;
                return this.createBookingBasedOnDeskStatus(entity);
            })
        );

        entities.map((e) => this.notificationService.createQuestionnaireNotifications(e.id, e.location.id));
        return entities;
    }

    async getBookings(userId: string, params?: BookingQueryParams): Promise<BookingPagination> {
        const page = params && params.page ? params.page : 1;
        const limit = params && params.limit ? params.limit : 100;
        const skippedItems = (page - 1) * limit;

        const queryBuilder = this.bookingRepository
            .createQueryBuilder("booking")
            .leftJoinAndMapOne("booking.location", LocationEntity, "location", "booking.locationId = location.id")
            .leftJoinAndMapOne("booking.desk", DeskEntity, "desk", "booking.deskId = desk.id")
            .leftJoinAndMapOne("desk.floor", LocationFloorEntity, "floor", "desk.floorId = floor.id")
            .leftJoinAndMapOne("booking.user", UserEntity, "user", "booking.userId = user.id")
            .leftJoinAndMapMany(
                "desk.deskResources",
                DeskResourceEntity,
                "deskResources",
                "deskResources.deskId = desk.id"
            )
            .leftJoinAndSelect("deskResources.resource", "resource")
            .andWhere("booking.userId = :userId", { userId });

        if (params.dateFrom && params.order === BookingOrderType.ASC) {
            queryBuilder
                .andWhere("booking.dateFrom >= :dateFrom", {
                    dateFrom: moment(params.dateFrom).format("YYYY-MM-DD HH:mm:ssZ")
                })
                .orWhere("booking.dateFrom is null");
        }

        if (params.dateFrom && params.order === BookingOrderType.DESC) {
            queryBuilder
                .andWhere("booking.dateFrom <= :dateFrom", {
                    dateFrom: moment(params.dateFrom).format("YYYY-MM-DD HH:mm:ssZ")
                })
                .orWhere("booking.dateFrom is null");
        }

        if (params.locationId) {
            queryBuilder.andWhere("booking.locationId = :locationId", {
                locationId: params.locationId
            });
        }

        if (params.order) {
            queryBuilder.orderBy("booking.dateFrom", params.order);
        }

        const [bookings, totalCount] = await queryBuilder.skip(skippedItems).take(limit).getManyAndCount();
        return {
            totalCount,
            page,
            limit,
            bookings
        };
    }

    async getBookingById(bookingId: string): Promise<BookingEntity> {
        const entity = await this.bookingRepository
            .createQueryBuilder("booking")
            .leftJoinAndMapOne("booking.location", LocationEntity, "location", "booking.locationId = location.id")
            .leftJoinAndMapOne("booking.desk", DeskEntity, "desk", "booking.deskId = desk.id")
            .leftJoinAndMapOne("desk.floor", LocationFloorEntity, "floor", "desk.floorId = floor.id")
            .leftJoinAndMapOne("booking.user", UserEntity, "user", "booking.userId = user.id")
            .leftJoinAndMapMany("user.deviceTokens", DeviceTokenEntity, "deviceTokens", "deviceTokens.userId = user.id")
            .leftJoinAndMapMany(
                "desk.deskResources",
                DeskResourceEntity,
                "deskResources",
                "deskResources.deskId = desk.id"
            )
            .leftJoinAndSelect("deskResources.resource", "resource")
            .andWhere("booking.id = :bookingId", { bookingId })
            .getOne();
        return entity ? entity : null;
    }

    async cancelBooking(bookingId: string): Promise<void> {
        const booking = await this.bookingRepository.findOne(bookingId);
        if (!booking) {
            return null;
        }
        await this.bookingRepository.update(bookingId, { status: BOOKING_STATUS_TYPE.CANCELED });
    }

    async createDailyBooking(request: BookingDailyCreateRequest): Promise<BookingEntity[]> {
        const { timeFrom, timeTo, location } = request;
        const [, , desk, user, disabledDates] = await Promise.all([
            this.validator.validateTimeFormat(timeFrom, timeTo),
            this.validator.validateBookingStartTime(timeFrom, timeTo),
            this.deskService.getDeskById(request.deskId),
            this.userService.getUserById(request.userId),
            this.calendarService.getDisabledDates(location.id)
        ]);

        if (!desk) {
            throw new DeskNotFoundException(request.deskId);
        }

        if (!user) {
            throw new UserNotFountException(request.userId);
        }

        let bookingsToCreate = this.mapper.mapCreateRequestToDailyBookingEntity(request, disabledDates);
        const firstDate = bookingsToCreate[0].dateFrom;
        const lastDate = _.last(bookingsToCreate).dateFrom;

        await this.validator.validateBookingExistence({
            dateFrom: firstDate,
            dateTo: lastDate,
            timeFrom,
            timeTo,
            locationId: location.id,
            userId: request.userId
        });

        const entities = await Promise.all(
            bookingsToCreate.map((bookingEntity) => {
                bookingEntity.desk = desk;
                bookingEntity.location = location;
                bookingEntity.user = user;
                return this.createBookingBasedOnDeskStatus(bookingEntity);
            })
        );

        entities.map((e) => this.notificationService.createQuestionnaireNotifications(e.id, e.location.id));
        return entities;
    }

    async createWeeklyBooking(request: BookingWeeklyCreateRequest[]): Promise<BookingEntity[]> {
        const entities = await Promise.all(
            request.map(async (data) => {
                const { timeFrom, timeTo, location } = data;
                const [, , desk, user, disabledDates] = await Promise.all([
                    this.validator.validateTimeFormat(timeFrom, timeTo),
                    this.validator.validateBookingStartTime(timeFrom, timeTo),
                    this.deskService.getDeskById(data.deskId),
                    this.userService.getUserById(data.userId),
                    this.calendarService.getDisabledDates(location.id)
                ]);

                if (!desk) {
                    throw new DeskNotFoundException(data.deskId);
                }

                if (!user) {
                    throw new UserNotFountException(data.userId);
                }

                let bookingsToCreate = this.mapper.mapCreateRequestToWeeklyBookingEntity(data, disabledDates);
                const firstDate = bookingsToCreate[0].dateFrom;
                const lastDate = _.last(bookingsToCreate).dateFrom;

                await this.validator.validateBookingExistence({
                    dateFrom: firstDate,
                    dateTo: lastDate,
                    timeFrom,
                    timeTo,
                    locationId: location.id,
                    userId: data.userId
                });

                const entities = await Promise.all(
                    bookingsToCreate.map((bookingEntity) => {
                        bookingEntity.desk = desk;
                        bookingEntity.location = location;
                        bookingEntity.user = user;
                        return this.createBookingBasedOnDeskStatus(bookingEntity);
                    })
                );

                entities.map((e) => this.notificationService.createQuestionnaireNotifications(e.id, e.location.id));
                return entities;
            })
        );

        return _.flatten(entities);
    }

    async getBookingUserIdsByDateRange(locationId: string, startDate: Date, endDate: Date): Promise<string[]> {
        const startDateStartOfDay = moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ssZ");
        const endDateEndOfDay = moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ssZ");

        const bookings = await this.bookingRepository
            .createQueryBuilder("booking")
            .select()
            .leftJoinAndMapOne("booking.user", UserEntity, "user", "booking.userId = user.id")
            .where("booking.dateFrom BETWEEN :startDateStartOfDay AND :endDateEndOfDay", {
                startDateStartOfDay,
                endDateEndOfDay
            })
            .andWhere("booking.status <> :status", { status: BOOKING_STATUS_TYPE.CANCELED })
            .andWhere("booking.locationId = :locationId", { locationId })
            .getMany();

        return _.uniq(bookings.map((item) => item.user.id));
    }

    async getBookingUserIdsByLocationId(locationId: string): Promise<string[]> {
        const bookings = await this.bookingRepository.find({
            where: { location: locationId, status: Not(BOOKING_STATUS_TYPE.CANCELED), user: Not(IsNull()) },
            relations: ["user"]
        });

        return _.uniq(bookings.map((item) => item.user.id));
    }

    async getBookedTimeSlotsByDeskIdAndMonth(
        deskId: string,
        monthNumber: number
    ): Promise<BookingCustomDateTimeSlot[]> {
        const startOfMonthDate = moment(new Date(`${moment().year()}-${monthNumber}`))
            .startOf("month")
            .format("YYYY-MM-DD HH:mm:ssZ");
        const endOfMonthDate = moment(new Date(`${moment().year()}-${monthNumber}`))
            .endOf("month")
            .format("YYYY-MM-DD HH:mm:ssZ");

        const bookings = await this.bookingRepository.find({
            where: {
                status: Not(BOOKING_STATUS_TYPE.CANCELED),
                dateFrom: Between(startOfMonthDate, endOfMonthDate),
                desk: deskId,
                type: BookingType.CUSTOM
            }
        });

        return this.mapper.mapToCustomBookingBookedDateTimeSlot(bookings);
    }

    async getBookingDatesByLocationId(locationId: string): Promise<BookingIdWithDate[]> {
        const bookings = await this.bookingRepository.find({
            where: { location: locationId, status: Not(BOOKING_STATUS_TYPE.CANCELED) }
        });

        if (!!bookings.length) {
            let customBookingsDates: BookingIdWithDate[] = this.mapper.mapFromBookingToDates(
                bookings.filter((booking) => booking.type == "custom")
            );

            let weeklyBookingsDates: BookingIdWithDate[] = this.mapper.mapFromBookingToDates(
                bookings.filter((booking) => booking.type == "weekly")
            );

            let dailyBookings = bookings.filter((booking) => booking.type == "daily");
            let dailyBookingsDates: BookingIdWithDate[] = [];
            if (!!dailyBookings.length) {
                dailyBookingsDates = this.mapper.mapFromBookingToDates(dailyBookings);
            }

            return [...customBookingsDates, ...dailyBookingsDates, ...weeklyBookingsDates];
        } else {
            return [];
        }
    }

    async updateBookingQuestionnaireStatus(bookingId: string, hasPassedQuestionnaire: boolean): Promise<void> {
        await this.bookingRepository.update(bookingId, { hasPassedQuestionnaire });
    }

    async getQuestionnaireBookings(userId: string): Promise<QuestionnaireBooking[]> {
        const startOfDay = moment().startOf("day").format("YYYY-MM-DD");
        const endOfDay = moment().endOf("day").format("YYYY-MM-DD");

        let bookings = await this.bookingRepository.find({
            where: {
                user: userId,
                status: BOOKING_STATUS_TYPE.BOOKED,
                hasPassedQuestionnaire: null,
                dateFrom: Between(startOfDay, endOfDay)
            },
            relations: ["location"]
        });

        const locationIds = bookings.map((b) => b.location.id);
        const questionnaireSchedules = (
            await Promise.all(
                locationIds.map((id) => this.covidQuestionService.getCovidQuestionnaireScheduleConfig(id))
            )
        ).filter((schedule) => schedule && schedule.isActive);

        if (!questionnaireSchedules.length) {
            return [];
        }

        bookings = bookings.filter((b) => {
            const userLocationCurrentTimeOnLogin = moment.tz(b.location.timezone).format("YYYY-MM-DD HH:mm");
            const schedule = questionnaireSchedules.find((s) => s.location.id === b.location.id);
            const bookingDate = moment(b.dateFrom).format("YYYY-MM-DD");
            const bookingStartDate = moment(new Date(`${bookingDate} ${b.timeFrom}`));
            const questionnaireStartDate = moment(bookingStartDate).subtract(schedule.startTime, "hours");

            return moment(userLocationCurrentTimeOnLogin).isBetween(questionnaireStartDate, bookingStartDate) ||
                moment(userLocationCurrentTimeOnLogin).isSame(questionnaireStartDate)
                ? true
                : false;
        });

        return bookings.map(this.mapper.mapToQuestionnaireBooking);
    }

    public async confirmBooking(token: string): Promise<BookingEntity> {
        const data = this.parseConfirmationToken(token);
        const { bookingId, email, action } = data as {
            bookingId: string;
            email: string;
            action: BOOKING_APPROVE_ACTION;
        };
        let entity = await this.getBookingById(bookingId);
        if (action == BOOKING_APPROVE_ACTION.APPROVE) {
            const approvers = await this.deskService.getApprovers(entity.desk.id);
            const currentApproval = await this.bookingApprovalsRepository.findOne({
                where: {
                    bookingId,
                    email
                }
            });
            if (!currentApproval.approved) {
                await this.bookingApprovalsRepository.save(
                    new BookingApprovalsEntity({
                        bookingId,
                        email,
                        approved: true
                    })
                );
                await this.processConfirmation(entity, approvers);
            }
        } else {
            await Promise.all([
                this.bookingRepository.update(entity.id, { status: BOOKING_STATUS_TYPE.CANCELED }),
                this.notificationService.sendBookingDeclinedEmail({
                    booking: entity
                })
            ]);
        }
        return entity;
    }

    public async createBookingBasedOnDeskStatus(entity: BookingEntity): Promise<BookingEntity> {
        const approvers = await this.deskService.getApprovers(entity.desk.id);
        entity.status = BOOKING_STATUS_TYPE.BOOKED;
        if (entity.desk.status == DESK_STATUS_TYPE.APPROVAL_REQUIRED && approvers.length) {
            entity.status = BOOKING_STATUS_TYPE.PENDING;
        } else {
            await this.notificationService.sendBookingConfirmedEmail({
                booking: entity
            });
        }
        entity = await this.bookingRepository.save(entity);
        if (entity.desk.status == DESK_STATUS_TYPE.APPROVAL_REQUIRED && approvers.length) {
            await this.mbSendApproveEmail(entity, approvers);
        }
        return entity;
    }

    private async mbSendApproveEmail(entity: BookingEntity, approvers: DeskApproverEntity[]) {
        await this.bookingApprovalsRepository
            .createQueryBuilder()
            .insert()
            .values(
                approvers.map(
                    (approver) =>
                        new BookingApprovalsEntity({
                            bookingId: entity.id,
                            email: approver.email,
                            approved: false
                        })
                )
            )
            .execute();
        return this.processConfirmation(entity, approvers);
    }

    private async processConfirmation(entity: BookingEntity, approvers: DeskApproverEntity[]) {
        const approver = await this.getNextApprover(entity, approvers);
        if (approver) {
            await this.sendApproveBookingEmail(entity, approver);
        } else {
            await this.bookingRepository.save({
                id: entity.id,
                status: BOOKING_STATUS_TYPE.BOOKED
            });
            return this.notificationService.sendBookingConfirmedEmail({
                booking: entity
            });
        }
    }

    private async getNextApprover(entity: BookingEntity, approvers: DeskApproverEntity[]) {
        let approvals = await this.bookingApprovalsRepository.find({
            where: {
                bookingId: entity.id
            }
        });
        return approvers.find((approver) => {
            return approvals.findIndex((approval) => approval.email == approver.email && !approval.approved) != -1;
        });
    }

    private async sendApproveBookingEmail(booking: BookingEntity, approver: DeskApproverEntity) {
        await this.notificationService.sendBookingConfirmationEmail({
            email: approver.email,
            booking,
            denyToken: this.generateApproveToken(
                booking.id,
                booking.desk.id,
                approver.email,
                BOOKING_APPROVE_ACTION.DECLINE
            ),
            approveToken: this.generateApproveToken(
                booking.id,
                booking.desk.id,
                approver.email,
                BOOKING_APPROVE_ACTION.APPROVE
            )
        });
    }

    private generateApproveToken(
        bookingId: string,
        deskId: string,
        email: string,
        action: BOOKING_APPROVE_ACTION
    ): string {
        return this.jwtService.sign(
            {
                bookingId,
                deskId,
                email,
                action
            },
            {
                expiresIn: "999d"
            }
        );
    }

    private parseConfirmationToken(token: string) {
        return this.jwtService.decode(token);
    }
}
