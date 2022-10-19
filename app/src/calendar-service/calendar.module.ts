import { forwardRef, Module } from "@nestjs/common";
import { CALENDAR_SERVICE } from "./ioc";
import { CalendarService } from "./calendar.service";
import { BookingModule } from "../booking-service/booking.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LocationModule } from "../location-service/location.module";
import { CalendarEntity } from "./entity/calendar.entity";
import { CalendarMapper } from "./calendar.mapper";
import { NotificationModule } from "../notification-service/notification.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CalendarEntity]),
        LocationModule,
        forwardRef(() => BookingModule),
        NotificationModule
    ],
    providers: [
        {
            provide: CALENDAR_SERVICE,
            useClass: CalendarService
        },
        CalendarMapper,
        CalendarService
    ],
    exports: [
        {
            provide: CALENDAR_SERVICE,
            useClass: CalendarService
        },
        CalendarService
    ]
})
export class CalendarModule {}
