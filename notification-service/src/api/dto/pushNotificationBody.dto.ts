import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import * as uuid from "uuid";

export class PushNotificationBody {
    @ApiProperty({
        example: "Notification subject"
    })
    @IsString()
    @IsNotEmpty()
    notificationSubject: string;

    @ApiProperty({
        example: "Notification text"
    })
    @IsString()
    @IsNotEmpty()
    notificationText: string;

    @ApiPropertyOptional({
        example: [
            "APA91bFoi3lMMre9G3XzR1LrF4ZT82_15MsMdEICogXSLB8-MrdkRuRQFwNI5u8Dh0cI90ABD3BOKnxkEla8cGdisbDHl5cVIkZah5QUhSAxzx4Roa7b4xy9tvx9iNSYw-eXBYYd8k1XKf8Q_Qq1X9-x-U-Y79vdPq",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        ]
    })
    @IsArray()
    @IsString({ each: true })
    deviceToken: string[];

    @ApiPropertyOptional({
        example: uuid.v4()
    })
    @IsUUID()
    @IsOptional()
    locationId?: string;

    @ApiPropertyOptional({
        example: uuid.v4()
    })
    @IsUUID()
    @IsOptional()
    bookingId?: string;
}
