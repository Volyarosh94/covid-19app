import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class CovidQuestionPresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    id: string;
    @ApiProperty()
    questionText: string;
    @ApiProperty()
    questionDetails: string;
    @ApiProperty({
        example: true
    })
    isPositive: boolean;
    @ApiProperty({
        example: new Date()
    })
    createdAt: Date;
    @ApiProperty({
        example: uuid.v4()
    })
    locationId: string;
}
