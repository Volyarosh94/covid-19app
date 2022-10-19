import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { NotificationModule } from "../notification-service/notification.module";
import { CronService } from "./cron.service";
import { CRON_SERVICE } from "./ioc";

@Module({
    imports: [ScheduleModule.forRoot(), NotificationModule],
    providers: [
        {
            provide: CRON_SERVICE,
            useClass: CronService
        }
    ],
    exports: [
        {
            provide: CRON_SERVICE,
            useClass: CronService
        }
    ]
})
export class CronModule {}
