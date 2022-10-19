import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class QuestionnaireSchedulePresentation {
    @ApiProperty({
        example: uuid.v4(),
        description: "questionnaire id"
    })
    id: string;

    @ApiProperty({
        example: 4,
        description: "questionnaire start time in hours"
    })
    startTime: number;

    @ApiProperty({
        example: 10,
        description: "questionnaire reminder time in minutes"
    })
    reminderTime: number;

    @ApiProperty({
        example: 5,
        description: "questionnaire cancellation time in minutes"
    })
    cancellationTime: number;

    @ApiProperty({
        example: true,
        description: "questionnaire availability flag"
    })
    isActive: boolean;

    @ApiProperty({
        example: uuid.v4(),
        description: "questionnaire location foreign key"
    })
    locationId: string;
}
