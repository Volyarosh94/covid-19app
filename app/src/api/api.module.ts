import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingModule } from "../booking-service/booking.module";
import { CalendarModule } from "../calendar-service/calendar.module";
import { CovidQuestionModule } from "../covid-question-service/covid.question.module";
import { CronModule } from "../cron-service/cron.module";
import { DeskModule } from "../desk-service/desk.module";
import { LocationModule } from "../location-service/location.module";
import { NotificationModule } from "../notification-service/notification.module";
import { ormConfig } from "../orm.config";
import { ResourceModule } from "../resource-service/resource.module";
import { UserModule } from "../user-service/user.module";
import { BookingController } from "./controllers/booking.controller";
import { BookingApprovalController } from "./controllers/bookingApproval.controller";
import { CalendarController } from "./controllers/calendar.controller";
import { CovidQuestionController } from "./controllers/covid.question.controller";
import { DeskController } from "./controllers/desk.controller";
import { DeskConfirmController } from "./controllers/deskConfirm.controller";
import { LocationController } from "./controllers/location.controller";
import { NotificationController } from "./controllers/notification.controller";
import { ResourceController } from "./controllers/resource.controller";
import { UserController } from "./controllers/user.controller";
import { AzureADStrategy } from "./guards/auth.guard";
import { BookingPresentationMapper } from "./mappers/bookingPresentation.mapper";
import { CovidQuestionPresentationMapper } from "./mappers/covidQuestionPresentation.mapper";
import { DeskPresentationMapper } from "./mappers/deskPresentation.mapper";
import { LocationPresentationMapper } from "./mappers/locationPresentation.mapper";
import { NotificationPresentationMapper } from "./mappers/notificationPresentation.mapper";
import { ResourcePresentationMapper } from "./mappers/resourcePresentation.mapper";
import { UserPresentationMapper } from "./mappers/userPresentation.mapper";

@Module({
    imports: [
        TypeOrmModule.forRoot(ormConfig),
        {
            ...JwtModule.register({ secret: process.env.JWT_SECRET }),
            global: true
        },
        BookingModule,
        LocationModule,
        ResourceModule,
        UserModule,
        DeskModule,
        CovidQuestionModule,
        PassportModule,
        NotificationModule,
        CalendarModule,
        CronModule
    ],
    controllers: [
        BookingApprovalController,
        BookingController,
        LocationController,
        ResourceController,
        UserController,
        DeskConfirmController,
        DeskController,
        CovidQuestionController,
        NotificationController,
        CalendarController
    ],
    providers: [
        BookingPresentationMapper,
        LocationPresentationMapper,
        UserPresentationMapper,
        AzureADStrategy,
        DeskPresentationMapper,
        NotificationPresentationMapper,
        CovidQuestionPresentationMapper,
        ResourcePresentationMapper
    ],
    exports: [JwtModule]
})
export class ApiModule {}
