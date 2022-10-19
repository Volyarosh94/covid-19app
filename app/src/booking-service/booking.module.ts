import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CalendarModule } from "../calendar-service/calendar.module";
import { CovidQuestionModule } from "../covid-question-service/covid.question.module";
import { CronModule } from "../cron-service/cron.module";
import { DeskModule } from "../desk-service/desk.module";
import { NotificationModule } from "../notification-service/notification.module";
import { UserModule } from "../user-service/user.module";
import { BookingMapper } from "./booking.mapper";
import { BookingService } from "./booking.service";
import { BookingEntity } from "./entity/booking.entity";
import { BookingApprovalsEntity } from "./entity/bookingApprovals.entity";
import { BOOKING_SERVICE } from "./ioc";
import { BookingValidator } from "./validators/bookingValidator";

@Module({
    imports: [
        TypeOrmModule.forFeature([BookingEntity, BookingApprovalsEntity]),
        DeskModule,
        CronModule,
        CovidQuestionModule,
        UserModule,
        NotificationModule,
        forwardRef(() => CalendarModule)
    ],
    providers: [
        {
            provide: BOOKING_SERVICE,
            useClass: BookingService
        },
        BookingMapper,
        BookingValidator,
        BookingService
    ],
    exports: [
        {
            provide: BOOKING_SERVICE,
            useClass: BookingService
        },
        BookingService
    ]
})
export class BookingModule {}
