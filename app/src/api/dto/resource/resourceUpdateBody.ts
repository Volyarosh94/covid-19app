import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class ResourceUpdateBody {
    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    isAvailable: boolean;
}
