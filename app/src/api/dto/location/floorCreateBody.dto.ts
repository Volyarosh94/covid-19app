import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty,
    IsNotEmptyObject,
    IsString } from "class-validator";
import { MapSize } from "./mapSize.dto";

export class FloorCreateBody {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    floorName: string;

    @ApiProperty({ type: MapSize })
    @IsNotEmptyObject()
    @Type(() => MapSize)
    mapSize: MapSize;
}
