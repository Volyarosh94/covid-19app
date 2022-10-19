import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ResourceEntity } from "./entity/resource.entity";
import { RESOURCE_SERVICE } from "./ioc";
import { ResourceService } from "./resource.service";

@Module({
    imports: [TypeOrmModule.forFeature([ResourceEntity])],
    providers: [
        {
            provide: RESOURCE_SERVICE,
            useClass: ResourceService
        }
    ],
    exports: [
        {
            provide: RESOURCE_SERVICE,
            useClass: ResourceService
        }
    ]
})
export class ResourceModule {}
