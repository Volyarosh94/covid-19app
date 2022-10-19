import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { NotificationRecipientType } from "../../../notification-service/contract/notificationRecipientType";

export class NotificationUpdateBody {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    subject?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    message?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    sendDate?: Date;

    @ApiPropertyOptional({
        example: NotificationRecipientType.HAS_BOOKING
    })
    @IsOptional()
    @IsEnum(NotificationRecipientType)
    recipients?: NotificationRecipientType;

    @ApiPropertyOptional({
        example: new Date("2021-05-10")
    })
    @IsOptional()
    @IsDateString()
    startDate?: Date;

    @ApiPropertyOptional({
        example: new Date("2021-05-15")
    })
    @IsOptional()
    @IsDateString()
    endDate?: Date;
}
