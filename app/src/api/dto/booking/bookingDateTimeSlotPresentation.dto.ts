import { ApiProperty } from "@nestjs/swagger";

export class BookingDateTimeSlotPresentation {
    @ApiProperty({
        example: "2021-06-15"
    })
    date: string;

    @ApiProperty({
        example: ["09:00:00+00 - 12:00:00+00", "12:00:00+00 - 15:00:00+00"]
    })
    slots: string[];
}
