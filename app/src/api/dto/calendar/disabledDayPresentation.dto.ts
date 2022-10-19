import { ApiProperty } from "@nestjs/swagger";

export class DisabledDaysPresentation{
    @ApiProperty({ example: new Date(1615290326744) })
    disabledDays: Date[];
    @ApiProperty({ example: new Date(1615290326744) })
    reservedDays: Date[];
}
