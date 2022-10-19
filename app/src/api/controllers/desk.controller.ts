import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Inject,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    UseFilters,
    UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IDeskService } from "../../desk-service/IDeskService";
import { DESK_SERVICE } from "../../desk-service/ioc";
import { ILocationService } from "../../location-service/ILocationService";
import { LOCATION_SERVICE } from "../../location-service/ioc";
import { UserId } from "../decorators/user.decorator";
import { DeskCreateOrUpdateBody } from "../dto/desk/deskCreateOrUpdateBody.dto";
import { DeskPresentation } from "../dto/desk/deskPresentation.dto";
import { SavedDeskCreateBody } from "../dto/desk/savedDeskCreateBody.dto";
import { SavedDeskPresentation } from "../dto/desk/savedDeskPresentation.dto";
import { FloorNotFoundHttpException } from "../exceptions/floorNotFoundHttpException";
import { SavedDeskAlreadyExistsHttpException } from "../exceptions/savedDeskAlreadyExistsHttpException";
import { NotFoundExceptionFilter } from "../filters/notFoundException.filter";
import { AzureADGuard } from "../guards/auth.guard";
import { DeskPresentationMapper } from "../mappers/deskPresentation.mapper";

@ApiTags("Desk")
@ApiBearerAuth()
@Controller("desks")
@UseGuards(AzureADGuard)
@UseFilters(NotFoundExceptionFilter)
export class DeskController {
    constructor(
        @Inject(DESK_SERVICE)
        private readonly deskService: IDeskService,
        @Inject(LOCATION_SERVICE)
        private readonly locationService: ILocationService,
        private readonly mapper: DeskPresentationMapper
    ) {}

    @Get("/saved")
    @ApiOperation({ summary: "Get list of saved desks" })
    @ApiOkResponse({ type: [SavedDeskPresentation] })
    async getSavedDesks(@UserId() userId: string): Promise<SavedDeskPresentation[]> {
        const entities = await this.deskService.getSavedDesks(userId);
        return entities.map(this.mapper.mapToSavedDeskPresentation);
    }

    @Post("/saved")
    @ApiOperation({ summary: "Add desk to saved list" })
    @ApiOkResponse({ type: SavedDeskPresentation })
    async addDeskToSaved(@Body() body: SavedDeskCreateBody, @UserId() userId: string): Promise<SavedDeskPresentation> {
        const existingSavedDesk = await this.deskService.getSavedDeskByDeskId(body.deskId, userId);

        if (existingSavedDesk) {
            throw new SavedDeskAlreadyExistsHttpException();
        }

        const entity = await this.deskService.addDeskToSaved({ ...body, userId });
        return this.mapper.mapToSavedDeskPresentation(entity);
    }

    @Get(":deskId/users/:userId/saved")
    @ApiOperation({ summary: "Get saved desk" })
    @ApiOkResponse({ type: SavedDeskPresentation })
    @ApiParam({ required: true, name: "userId", type: String })
    async getSavedDesk(
        @Param("deskId", new ParseUUIDPipe({ version: "4" })) deskId: string,
        @Param("userId", new ParseUUIDPipe({ version: "4" })) userId: string
    ): Promise<SavedDeskPresentation> {
        const entity = await this.deskService.getSavedDeskByDeskId(deskId, userId);
        return this.mapper.mapToSavedDeskPresentation(entity);
    }

    @Delete(":deskId/users/:userId/saved")
    @ApiOperation({ summary: "Remove desk from saved list" })
    @ApiResponse({ status: 200 })
    @ApiParam({ required: true, name: "userId", type: String })
    async removedSavedDesk(
        @Param("deskId", new ParseUUIDPipe({ version: "4" })) deskId: string,
        @Param("userId", new ParseUUIDPipe({ version: "4" })) userId: string
    ): Promise<void> {
        return this.deskService.removeSavedDesk(deskId, userId);
    }

    @Put(":floorId")
    @ApiOperation({ summary: "Add or update desk" })
    @ApiOkResponse({ type: DeskPresentation })
    async insertOrUpdateDesk(
        @Param("floorId", new ParseUUIDPipe({ version: "4" })) floorId: string,
        @Body() body: DeskCreateOrUpdateBody
    ): Promise<DeskPresentation> {
        const floor = await this.locationService.getLocationFloor(floorId);

        if (!floor) {
            throw new FloorNotFoundHttpException(floorId);
        }

        const entity = await this.deskService.insertOrUpdateDesk(floorId, body);
        return this.mapper.mapToDeskPresentation(entity);
    }

    @Get(":deskId")
    @ApiOperation({ summary: "Get a certain desk by id" })
    @ApiOkResponse({ type: DeskPresentation })
    async get(@Param("deskId", new ParseUUIDPipe({ version: "4" })) deskId: string): Promise<DeskPresentation> {
        const entity = await this.deskService.getDeskById(deskId);
        return this.mapper.mapToDeskPresentation(entity);
    }

    @Delete(":deskId/floor/:floorId")
    @ApiOperation({ summary: "Remove a certain desk by id" })
    @ApiResponse({ status: HttpStatus.OK })
    async delete(
        @Param("deskId", new ParseUUIDPipe({ version: "4" })) deskId: string,
        @Param("floorId", new ParseUUIDPipe({ version: "4" })) floorId: string
    ): Promise<void> {
        await Promise.all([
            this.deskService.removeDesk(deskId),
            this.locationService.removeDeskFromSchema(floorId, deskId)
        ]);
    }
}
