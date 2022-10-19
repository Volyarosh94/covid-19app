import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { NotificationRecipientType } from "../../../notification-service/contract/notificationRecipientType";

export class NotificationBody {
    @ApiProperty({
        example: NotificationRecipientType.HAS_BOOKING
    })
    @IsEnum(NotificationRecipientType)
    @IsNotEmpty()
    recipientType: NotificationRecipientType;

    @ApiPropertyOptional({
        example: new Date("2021-05-10")
    })
    @IsOptional()
    @IsDateString()
    startDate?: Date;

    @ApiPropertyOptional({
        example: new Date("2021-05-12")
    })
    @IsOptional()
    @IsDateString()
    endDate?: Date;
}
