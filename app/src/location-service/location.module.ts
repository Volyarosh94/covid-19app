import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FloorMapEntity } from "./entity/floorMap.entity";
import { FloorSchemaEntity } from "./entity/floorSchema.entity";
import { LocationEntity } from "./entity/location.entity";
import { LocationFloorEntity } from "./entity/locationFloor.entity";
import { LOCATION_SERVICE } from "./ioc";
import { LocationMapper } from "./location.mapper";
import { LocationService } from "./location.service";
import { GoogleAutocompleteParseDataMappers } from "./googleMapsUtils/googleAutocompleteParseData.mappers";
import { ResourceModule } from "../resource-service/resource.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([LocationEntity, LocationFloorEntity, FloorSchemaEntity, FloorMapEntity]),
        ResourceModule
    ],
    providers: [
        {
            provide: LOCATION_SERVICE,
            useClass: LocationService
        },
        LocationMapper,
        GoogleAutocompleteParseDataMappers
    ],
    exports: [
        {
            provide: LOCATION_SERVICE,
            useClass: LocationService
        }
    ]
})
export class LocationModule {}
