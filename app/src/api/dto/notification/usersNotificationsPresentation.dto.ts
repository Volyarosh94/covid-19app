import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString } from "class-validator";
import * as uuid from "uuid";

export class UsersNotificationsPresentation {
    @ApiProperty({ example: uuid.v4() })
    @IsString()
    id: string;

    @ApiProperty({ example: uuid.v4() })
    userId: string;

    @ApiProperty({ example: "Notification title" })
    subject: string;

    @ApiProperty({ example: "Notification message" })
    message: string;

    @ApiProperty({
        example: new Date()
    })
    sendDate: Date;

    @ApiProperty({
        example: true
    })
    @IsBoolean()
    isWatched: boolean;
}
