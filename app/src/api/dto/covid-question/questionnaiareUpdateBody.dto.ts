import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsUUID } from "class-validator";
import * as uuid from "uuid";

export class QuestionnaireScheduleUpdateBody {
    @ApiProperty({
        example: uuid.v4()
    })
    @IsNotEmpty()
    @IsUUID("4")
    id: string;

    @ApiProperty({
        example: 4
    })
    @IsNotEmpty()
    @IsNumber()
    startTime: number;

    @ApiProperty({
        example: 10
    })
    @IsNotEmpty()
    @IsNumber()
    reminderTime: number;

    @ApiProperty({
        example: 5
    })
    @IsNotEmpty()
    @IsNumber()
    cancellationTime: number;

    @ApiProperty({
        example: false
    })
    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean;
}
