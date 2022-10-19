import { NotificationModule } from "./../notification-service/notification.module";
import { DeskApproverEntity } from "./entity/deskApprover.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LocationModule } from "../location-service/location.module";
import { ResourceModule } from "../resource-service/resource.module";
import { DeskEntity } from "./entity/desk.entity";
import { DeskResourceEntity } from "./entity/deskResource.entity";
import { DESK_SERVICE } from "./ioc";
import { DeskMapper } from "./desk.mapper";
import { DeskService } from "./desk.service";
import { SavedDeskEntity } from "./entity/savedDesk.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([DeskEntity, DeskApproverEntity, DeskResourceEntity, SavedDeskEntity]),
        LocationModule,
        ResourceModule,
        NotificationModule,
    ],
    providers: [
        {
            provide: DESK_SERVICE,
            useClass: DeskService
        },
        DeskMapper
    ],
    exports: [
        {
            provide: DESK_SERVICE,
            useClass: DeskService
        }
    ]
})
export class DeskModule {}
