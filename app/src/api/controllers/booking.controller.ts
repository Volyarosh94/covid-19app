import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Inject,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    UseFilters,
    UseGuards
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiBody,
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
    getSchemaPath
} from "@nestjs/swagger";
import { BookingType } from "../../booking-service/contract/bookingType";
import { IBookingService } from "../../booking-service/IBookingService";
import { BOOKING_SERVICE } from "../../booking-service/ioc";
import { IDeskService } from "../../desk-service/IDeskService";
import { DESK_SERVICE } from "../../desk-service/ioc";
import { ILocationService } from "../../location-service/ILocationService";
import { LOCATION_SERVICE } from "../../location-service/ioc";
import { UserId } from "../decorators/user.decorator";
import { BookingCreateBody } from "../dto/booking/bookingCreateBody.dto";
import { BookingDateTimeSlotPresentation } from "../dto/booking/bookingDateTimeSlotPresentation.dto";
import { BookingFilterQuery } from "../dto/booking/bookingFilterQuery";
import { BookingsPaginatedPresentation } from "../dto/booking/bookingPaginatedPresentation.dto";
import { BookingPresentation } from "../dto/booking/bookingPresentation.dto";
import { QuestionnaireBookingPresentation } from "../dto/booking/questionnaireBookingPresentation.dto";
import { DeskFilterQuery } from "../dto/desk/deskFilterQuery.dto";
import { DeskPresentation } from "../dto/desk/deskPresentation.dto";
import { FloorNotFoundHttpException } from "../exceptions/floorNotFoundHttpException";
import { LocationNotFoundHttpException } from "../exceptions/locationNotFoundHttpException";
import { NotFoundExceptionFilter } from "../filters/notFoundException.filter";
import { AzureADGuard } from "../guards/auth.guard";
import { BookingPresentationMapper } from "../mappers/bookingPresentation.mapper";
import { DeskPresentationMapper } from "../mappers/deskPresentation.mapper";

@ApiTags("Bookings")
@ApiBearerAuth()
@Controller("bookings")
@UseGuards(AzureADGuard)
@UseFilters(NotFoundExceptionFilter)
export class BookingController {
    constructor(
        @Inject(BOOKING_SERVICE)
        private readonly bookingService: IBookingService,
        @Inject(LOCATION_SERVICE)
        private readonly locationService: ILocationService,
        private readonly mapper: BookingPresentationMapper,
        @Inject(DESK_SERVICE)
        private readonly deskService: IDeskService,
        private readonly deskMapper: DeskPresentationMapper
    ) {}

    @Get()
    @ApiOperation({ summary: "Get all bookings" })
    @ApiOkResponse({ type: [BookingsPaginatedPresentation] })
    async getAll(
        @UserId() userId: string,
        @Query() query?: BookingFilterQuery
    ): Promise<BookingsPaginatedPresentation> {
        const result = await this.bookingService.getBookings(userId, query);
        return {
            ...result,
            bookings: result.bookings.map(this.mapper.mapBookingToPresentation)
        };
    }

    @Get("/questionnaire-bookings")
    @ApiOperation({ summary: "Get bookings for covid questionnaire" })
    @ApiResponse({ status: HttpStatus.OK, type: [QuestionnaireBookingPresentation] })
    async getQuestionnaireBookings(@UserId() userId: string): Promise<QuestionnaireBookingPresentation[]> {
        return this.bookingService.getQuestionnaireBookings(userId);
    }

    @Post(":locationId/bookingType/:bookingType")
    @ApiOperation({ summary: "Create booking" })
    @ApiOkResponse({ type: BookingPresentation })
    @ApiParam({ name: "bookingType", enum: BookingType, required: true })
    @ApiBody({ type: BookingCreateBody })
    async create(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string,
        @Param("bookingType") bookingType: BookingType,
        @Body() body: BookingCreateBody | BookingCreateBody[],
        @UserId() userId: string
    ): Promise<BookingPresentation[] | BookingPresentation> {
        const location = await this.locationService.getLocationById(locationId);
        if (!location) {
            throw new LocationNotFoundHttpException(locationId);
        }
        if (bookingType === BookingType.CUSTOM && !Array.isArray(body)) {
            const bookings = await this.bookingService.createCustomBooking({ ...body, userId, location });
            return bookings.map(this.mapper.mapBookingToPresentation);
        } else if (bookingType === BookingType.DAILY && !Array.isArray(body)) {
            const bookings = await this.bookingService.createDailyBooking({ ...body, userId, location });
            return bookings.map(this.mapper.mapBookingToPresentation);
        } else if (bookingType === BookingType.WEEKLY && Array.isArray(body)) {
            const createBody = body.map((data) => ({
                location,
                userId,
                ...data
            }));
            const bookings = await this.bookingService.createWeeklyBooking(createBody);
            return bookings.map(this.mapper.mapBookingToPresentation);
        }

        return null;
    }

    @Get(":bookingId")
    @ApiOperation({ summary: "Get booking by id" })
    @ApiOkResponse({ type: BookingPresentation })
    async get(
        @Param("bookingId", new ParseUUIDPipe({ version: "4" })) bookingId: string
    ): Promise<BookingPresentation> {
        const booking = await this.bookingService.getBookingById(bookingId);
        return this.mapper.mapBookingToPresentation(booking);
    }

    @Delete(":bookingId")
    @ApiOperation({ summary: "Cancel booking" })
    @ApiResponse({ status: HttpStatus.OK })
    async cancelBooking(@Param("bookingId", new ParseUUIDPipe({ version: "4" })) bookingId: string): Promise<void> {
        return this.bookingService.cancelBooking(bookingId);
    }

    @Get(":floorId/desks")
    @ApiOperation({ summary: "Get available desks" })
    @ApiOkResponse({ type: [DeskPresentation] })
    @ApiExtraModels(DeskFilterQuery)
    @ApiQuery({
        name: "custom",
        required: false,
        explode: true,
        style: "deepObject",
        type: DeskFilterQuery,
        schema: {
            $ref: getSchemaPath(DeskFilterQuery)
        }
    })
    @ApiQuery({
        name: "daily",
        required: false,
        explode: true,
        style: "deepObject",
        type: DeskFilterQuery,
        schema: {
            $ref: getSchemaPath(DeskFilterQuery)
        }
    })
    @ApiQuery({
        name: "weekly",
        required: false,
        explode: true,
        style: "deepObject",
        type: DeskFilterQuery,
        schema: {
            $ref: getSchemaPath(DeskFilterQuery)
        }
    })
    async getAvailableDesks(
        @Param("floorId", new ParseUUIDPipe({ version: "4" })) floorId: string,
        @Query() query?: DeskFilterQuery
    ): Promise<DeskPresentation[]> {
        const floor = await this.locationService.getLocationFloor(floorId);

        if (!floor) {
            throw new FloorNotFoundHttpException(floorId);
        }

        if (!query) {
            const entities = await this.deskService.getFloorDesks(floorId);
            return entities.map((entity) => this.deskMapper.mapToDeskPresentation(entity));
        } else {
            const entities = await this.deskService.getAvailableDesksByDateTime(floorId, query);
            return entities.map((entity) => this.deskMapper.mapToBookedDeskPresentation(entity, query));
        }
    }

    @Get(":deskId/month/:monthNumber")
    @ApiOperation({ summary: "Get booked time slots for desk" })
    @ApiResponse({ type: BookingDateTimeSlotPresentation })
    @ApiParam({ name: "monthNumber", type: Number, required: true })
    async getBookedTimeSlotsByDeskId(
        @Param("deskId", new ParseUUIDPipe({ version: "4" })) deskId: string,
        @Param("monthNumber", new ParseIntPipe()) monthNumber: number
    ): Promise<BookingDateTimeSlotPresentation[]> {
        return this.bookingService.getBookedTimeSlotsByDeskIdAndMonth(deskId, monthNumber);
    }

    @Put(":bookingId/hasPassedQuestionnaire/:hasPassedQuestionnaire")
    @ApiOperation({ summary: "Update booking questionnaire status" })
    @ApiResponse({ status: HttpStatus.OK })
    @ApiParam({ required: true, name: "hasPassedQuestionnaire", type: Boolean })
    async updateBookingQuestionnaireStatus(
        @Param("bookingId", new ParseUUIDPipe({ version: "4" })) bookingId: string,
        @Param("hasPassedQuestionnaire") hasPassedQuestionnaire: boolean
    ): Promise<void> {
        if (hasPassedQuestionnaire) {
            await this.bookingService.updateBookingQuestionnaireStatus(bookingId, hasPassedQuestionnaire);
        } else {
            await Promise.all([
                this.bookingService.updateBookingQuestionnaireStatus(bookingId, hasPassedQuestionnaire),
                this.bookingService.cancelBooking(bookingId)
            ]);
        }
    }
}
