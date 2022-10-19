import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";

export class DisabledDatesBody {
    @ApiProperty({
        example: ["2021-06-10T10:00:00.000Z", "2021-06-17T10:00:00.000Z"]
    })
    @IsArray()
    disabledDates: string[];
}
