import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class QuestionnaireBookingPresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    bookingId: string;

    @ApiProperty({
        example: uuid.v4()
    })
    locationId: string;
}
