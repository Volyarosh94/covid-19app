import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class UserProfilePresentation{
    @ApiProperty({
        example: uuid.v4()
    })
    id: string;
    @ApiProperty({
        example: "MeganB@M365x214355.onmicrosoft.com"
    })
    email: string;
    @ApiProperty({
        example: "Megan Bowen"
    })
    name: string;
    @ApiProperty({
        example: "+1 412 555 0109"
    })
    mobilePhone: string;
    @ApiProperty({
        example: "100 Wellington St, Leeds, LS1 4LT", nullable: true
    })
    location?: string;
}
