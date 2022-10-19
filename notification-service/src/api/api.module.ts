import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { NotificationModule } from "../notification-service/notification.module";
import { NotificationController } from "./controllers/notification.controller";
import { AzureADStrategy } from "./guards/auth.guard";

@Module({
    imports: [PassportModule, NotificationModule],
    controllers: [NotificationController],
    providers: [AzureADStrategy]
})
export class ApiModule {}
