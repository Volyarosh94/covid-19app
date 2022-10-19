import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { NotificationRecipientType } from "../../../notification-service/contract/notificationRecipientType";

export class NotificationCreateBody {
    @ApiProperty({
        example: "Subject"
    })
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({
        example: "Notification message"
    })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiPropertyOptional({
        example: new Date()
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    sendDate?: Date;

    @ApiProperty({
        example: NotificationRecipientType.HAS_BOOKING
    })
    @IsEnum(NotificationRecipientType)
    @IsNotEmpty()
    recipients: NotificationRecipientType;

    @ApiPropertyOptional({
        example: new Date("2021-05-10")
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    startDate?: Date;

    @ApiPropertyOptional({
        example: new Date("2021-05-15")
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    endDate?: Date;
}
