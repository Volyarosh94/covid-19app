import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangeFloorNameBody {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    floorName: string;
}
