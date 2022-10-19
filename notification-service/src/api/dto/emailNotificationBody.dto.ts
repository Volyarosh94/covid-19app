import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty,  IsString,  } from "class-validator";


export class EmailNotificationBody {
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

    @ApiProperty({
        example: ["recipient1@example.org", "recipient2@example.org"]
    })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    recipients: string[];   

}
