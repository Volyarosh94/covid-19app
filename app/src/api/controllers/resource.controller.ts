import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RESOURCE_SERVICE } from "../../resource-service/ioc";
import { IResourceService } from "../../resource-service/IResourceService";
import { ResourcePresentation } from "../dto/resource/resourcePresentation.dto";
import { ResourceUpdateBody } from "../dto/resource/resourceUpdateBody";
import { AzureADGuard } from "../guards/auth.guard";
import { ResourcePresentationMapper } from "../mappers/resourcePresentation.mapper";

@ApiTags("Resources")
@ApiBearerAuth()
@Controller("resources")
@UseGuards(AzureADGuard)
export class ResourceController {
    constructor(
        @Inject(RESOURCE_SERVICE)
        private readonly resourceService: IResourceService,
        private readonly mapper: ResourcePresentationMapper
    ) {}

    @Get("locations/:locationId/location-resources")
    @ApiOperation({ summary: "Get all resources in location" })
    @ApiOkResponse({ type: [ResourcePresentation] })
    async getAll(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string
    ): Promise<ResourcePresentation[]> {
        const entities = await this.resourceService.getLocationResources(locationId);
        return entities.map(this.mapper.mapToPresentation);
    }

    @Put(":resourceId")
    @ApiOperation({ summary: "Update resource" })
    @ApiOkResponse({ type: ResourcePresentation })
    async update(
        @Param("resourceId", new ParseUUIDPipe({ version: "4" })) resourceId: string,
        @Body() body: ResourceUpdateBody
    ): Promise<ResourcePresentation> {
        const entity = await this.resourceService.updateResource(resourceId, body.isAvailable);
        return this.mapper.mapToPresentation(entity);
    }

    @Delete(":resourceId")
    @ApiOperation({ summary: "Remove resource" })
    @ApiResponse({ status: 200 })
    async delete(
        @Param("resourceId", new ParseUUIDPipe({ version: "4" })) resourceId: string
    ): Promise<{ id: string }> {
        const id = await this.resourceService.removeResource(resourceId);
        return { id };
    }
}
