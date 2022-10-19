import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class DeskApproverPresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    deskId: string;

    @ApiProperty({
        example: "test@test.com"
    })
    email: string;

    @ApiProperty({
        example: true
    })
    confirmed: boolean;

    @ApiProperty({
        example: 1
    })
    sort?: number;
}
