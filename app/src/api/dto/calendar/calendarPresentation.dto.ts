import { ApiProperty } from "@nestjs/swagger";

export class CalendarPresentation {
    @ApiProperty({ example: [new Date(1615290326744).toISOString(), new Date(1645290326744).toISOString()] })
    disabledDates: string[];
    @ApiProperty({ example: [new Date(1615294326744).toISOString(), new Date(1645293326744).toISOString()] })
    reservedDates: string[];
}
