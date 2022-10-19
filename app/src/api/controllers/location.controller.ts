import {
    BadRequestException,
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
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
    getSchemaPath
} from "@nestjs/swagger";
import * as multer from "multer";
import { extname } from "path";
import { IDeskService } from "../../desk-service/IDeskService";
import { DESK_SERVICE } from "../../desk-service/ioc";
import { GoogleLocations } from "../../location-service/contract/googleLocations";
import { ILocationService } from "../../location-service/ILocationService";
import { LOCATION_SERVICE } from "../../location-service/ioc";
import { SectionNeighbour } from "../../user-service/contract/sectionNeighbour";
import { DeskFilterQuery } from "../dto/desk/deskFilterQuery.dto";
import { ChangeFloorNameBody } from "../dto/location/changeFloorNameBody.dto";
import { FloorCreateBody } from "../dto/location/floorCreateBody.dto";
import { FloorFilterQuery } from "../dto/location/floorFilterQuery";
import { FloorMapPresentation } from "../dto/location/floorMapPresentation.dto";
import { FloorPresentation } from "../dto/location/floorPresentation.dto";
import { FloorSchemaCreateBody } from "../dto/location/floorSchemaCreateBody.dto";
import { FloorSchemaPresentation } from "../dto/location/floorSchemaPresentation.dto";
import { FloorWithDesksAndSitsCountPresentation } from "../dto/location/floorWithDesksAndSitsCountPresentation.dto";
import { FloorWithDesksCountAdminPresentation } from "../dto/location/floorWithDesksCountAdminPresentation";
import { GoogleAutocompletePresentation } from "../dto/location/googleAutocompletePresentation.dto";
import { LocationCreateBody } from "../dto/location/locationCreateBody.dto";
import { LocationPresentation } from "../dto/location/locationPresentation.dto";
import { LocationUpdateBody } from "../dto/location/locationUpdateBody.dto";
import { SectionNeighboursPresentation } from "../dto/user/SectionNeighboursPresentation.dto";
import { FloorNotFoundHttpException } from "../exceptions/floorNotFoundHttpException";
import { LocationNotFoundHttpException } from "../exceptions/locationNotFoundHttpException";
import { AzureADGuard } from "../guards/auth.guard";
import { LocationPresentationMapper } from "../mappers/locationPresentation.mapper";

const FILE_CONSTRAINTS = {
    MAX_SIZE: 10485760,
    ALLOWED_MIMETYPES: ["application/octet-stream", "image/jpeg", "image/png"]
};

const multerOptions: MulterOptions = {
    limits: {
        fileSize: FILE_CONSTRAINTS.MAX_SIZE
    },
    fileFilter: (_req: Request, file, cb) => {
        if (FILE_CONSTRAINTS.ALLOWED_MIMETYPES.indexOf(file.mimetype) !== -1) {
            cb(null, true);
        } else {
            cb(new BadRequestException(`Not allowed file extension ${extname(file.originalname)}`), false);
        }
    }
};

@ApiTags("Locations")
@ApiBearerAuth()
@Controller("locations")
@UseGuards(AzureADGuard)
export class LocationController {
    constructor(
        @Inject(LOCATION_SERVICE)
        private readonly locationService: ILocationService,
        private readonly mapper: LocationPresentationMapper,
        @Inject(DESK_SERVICE)
        private readonly deskService: IDeskService
    ) {}

    @Post()
    @ApiOperation({ summary: "Create location" })
    @ApiOkResponse({ type: [LocationPresentation] })
    async create(@Body() body: LocationCreateBody): Promise<LocationPresentation> {
        const location = await this.locationService.createLocation(body);
        return this.mapper.mapToLocationPresentation(location);
    }

    @Get("address")
    @ApiOperation({ summary: "Get addresses" })
    @ApiOkResponse({ type: GoogleAutocompletePresentation })
    async getAddresses(@Query("query") query: string): Promise<GoogleLocations[]> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const addressQuery = await this.locationService.getAddresses(query);
        return addressQuery;
    }

    @Post(":locationId/floor")
    @ApiOperation({ summary: "Add floor of a location" })
    @ApiOkResponse({ type: LocationPresentation })
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("map", { storage: multer.memoryStorage(), ...multerOptions }))
    async addLocationFloor(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string,
        @Body() body: FloorCreateBody,
        @UploadedFile() file: Express.Multer.File
    ): Promise<FloorPresentation> {
        const location = await this.locationService.getLocationById(locationId);
        if (!location) {
            throw new LocationNotFoundHttpException(locationId);
        }

        const existingFloor = await this.locationService.getFloorByName(locationId, body.floorName);

        if (existingFloor) {
            throw new BadRequestException(`Floor with the name ${body.floorName} already exists`);
        }

        const entity = await this.locationService.addLocationFloor(locationId, body, file);
        return this.mapper.mapToFloorPresentation(entity);
    }

    @Put(":floorId/floor")
    @ApiOperation({ summary: "Update floor name" })
    @ApiOkResponse({ type: FloorPresentation })
    async updateFloorName(
        @Param("floorId", new ParseUUIDPipe({ version: "4" })) floorId: string,
        @Body() body: ChangeFloorNameBody
    ): Promise<FloorPresentation> {
        const floor = await this.locationService.getLocationFloor(floorId);

        if (!floor) {
            throw new FloorNotFoundHttpException(floorId);
        }

        const entity = await this.locationService.updateFloorName(floorId, body.floorName);
        return this.mapper.mapToFloorPresentation(entity);
    }

    @Get()
    @ApiOperation({ summary: "Get all locations" })
    @ApiOkResponse({ type: LocationPresentation, isArray: true })
    async getAll(): Promise<LocationPresentation[]> {
        const locations = await this.locationService.getLocations();
        return locations.map(this.mapper.mapToLocationPresentation);
    }

    @Get("addresses")
    @ApiOperation({ summary: "get location's addresses" })
    @ApiResponse({ isArray: true })
    async getLocationsAddresses(): Promise<string[]> {
        return this.locationService.getLocationsAddresses();
    }

    @Get(":locationId/admin/floors")
    @ApiOperation({ summary: "Get floors of a certain location by admin" })
    @ApiOkResponse({ type: FloorWithDesksCountAdminPresentation, isArray: true })
    async getByAdminLocationFloors(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string
    ): Promise<FloorWithDesksCountAdminPresentation[]> {
        return this.locationService.getAdminLocationFloors(locationId);
    }

    @Get(":locationId")
    @ApiOperation({ summary: "Get location by id" })
    @ApiOkResponse({ type: LocationPresentation })
    async getLocationById(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string
    ): Promise<LocationPresentation> {
        const location = await this.locationService.getLocationById(locationId);
        return this.mapper.mapToLocationPresentation(location);
    }

    @Get(":locationId/floors")
    @ApiOperation({ summary: "Get floors of a certain location" })
    @ApiOkResponse({ type: FloorWithDesksAndSitsCountPresentation, isArray: true })
    @ApiExtraModels(FloorFilterQuery)
    @ApiQuery({
        name: "custom",
        required: false,
        explode: true,
        style: "deepObject",
        type: FloorFilterQuery,
        schema: {
            $ref: getSchemaPath(FloorFilterQuery)
        }
    })
    @ApiQuery({
        name: "daily",
        required: false,
        explode: true,
        style: "deepObject",
        type: FloorFilterQuery,
        schema: {
            $ref: getSchemaPath(FloorFilterQuery)
        }
    })
    @ApiQuery({
        name: "weekly",
        required: false,
        explode: true,
        style: "deepObject",
        type: FloorFilterQuery,
        schema: {
            $ref: getSchemaPath(FloorFilterQuery)
        }
    })
    async getLocationFloors(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string,
        @Query() query?: FloorFilterQuery
    ): Promise<FloorWithDesksAndSitsCountPresentation[]> {
        const floors = await this.locationService.getLocationFloorsWithAvailableDesksCount(locationId, query);
        return floors.map(this.mapper.mapToFloorWithDesksAndSits);
    }

    @Get(":floorId/floor-schema")
    @ApiOperation({ summary: "Get schema of a location" })
    @ApiOkResponse({ type: FloorSchemaPresentation })
    async getFloorSchema(
        @Param("floorId", new ParseUUIDPipe({ version: "4" })) floorId: string
    ): Promise<FloorSchemaPresentation> {
        return this.locationService.getFloorSchema(floorId);
    }

    @Put(":floorId/floor-schema")
    @ApiOperation({ summary: "Update floor schema" })
    @ApiResponse({ status: HttpStatus.OK })
    async updateSchema(
        @Param("floorId", new ParseUUIDPipe({ version: "4" })) floorId: string,
        @Body() body: FloorSchemaCreateBody
    ): Promise<void> {
        const floor = await this.locationService.getLocationFloor(floorId);

        if (!floor) {
            throw new FloorNotFoundHttpException(floorId);
        }

        await Promise.all([
            this.locationService.updateFloorSchema(floorId, [
                ...body.desks?.map(({ deskSchema }) => deskSchema),
                ...body.sections
            ]),
            Promise.all(body.desks?.map(async (desk) => await this.deskService.insertOrUpdateDesk(floorId, desk)))
        ]);
    }

    @Get(":floorId/floor-map")
    @ApiOperation({ summary: "Get map of a floor" })
    @ApiOkResponse({ type: FloorMapPresentation })
    getFloorMap(@Param("floorId", new ParseUUIDPipe({ version: "4" })) floorId: string): Promise<FloorMapPresentation> {
        return this.locationService.getFloorMap(floorId);
    }

    @Put(":locationId")
    @ApiOperation({ summary: "Update location" })
    @ApiOkResponse({ type: [LocationPresentation] })
    async update(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string,
        @Body() body: LocationUpdateBody
    ): Promise<LocationPresentation> {
        const location = await this.locationService.getLocationById(locationId);

        if (!location) {
            throw new LocationNotFoundHttpException(locationId);
        }

        return this.locationService.updateLocation(locationId, body);
    }

    @Delete(":locationId")
    @ApiOperation({ summary: "Remove location" })
    @ApiOkResponse({ status: HttpStatus.OK })
    async delete(@Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string): Promise<string> {
        return this.locationService.removeLocation(locationId);
    }

    @Delete(":floorId/section/:sectionId")
    @ApiOperation({ summary: "Remove section" })
    @ApiOkResponse({ status: HttpStatus.OK })
    async removeSection(
        @Param("floorId", new ParseUUIDPipe({ version: "4" })) floorId: string,
        @Param("sectionId") sectionId: number
    ): Promise<void> {
        await this.locationService.removeSectionFromSchema(floorId, sectionId);
    }

    @Delete(":floorId/floor")
    @ApiOperation({ summary: "Delete floor" })
    @ApiResponse({ status: HttpStatus.OK })
    async removeLocationFloor(@Param("floorId", new ParseUUIDPipe({ version: "4" })) floorId: string): Promise<void> {
        await this.locationService.removeLocationFloor(floorId);
    }

    @Get("section/:sectionId/users")
    @ApiOperation({ summary: "Get desk neighbours in section" })
    @ApiOkResponse({ type: SectionNeighboursPresentation, isArray: true })
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
    async getSectionNeighbours(
        @Param("sectionId") sectionId: number,
        @Query() query: DeskFilterQuery
    ): Promise<SectionNeighbour[]> {
        return this.deskService.getSectionNeighbours(sectionId, query);
    }
}
