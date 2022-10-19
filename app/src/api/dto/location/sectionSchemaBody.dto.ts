import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { DrawingType } from "../../../location-service/contract/floorSchema";
import { CoordinateBody } from "./coordinateBody.dto";

export class SectionSchemaBody {
    @ApiProperty({
        example: DrawingType.SECTION
    })
    @IsNotEmpty()
    @IsString()
    type: DrawingType;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    sectionId: number;

    @ApiProperty({
        example: "#4847663b"
    })
    @IsString()
    @IsNotEmpty()
    fill: string;

    @ApiProperty({ type: [CoordinateBody] })
    @IsArray()
    @ArrayNotEmpty()
    coordinates: CoordinateBody[];

    @ApiProperty({
        example: "#484766cc"
    })
    @IsString()
    @IsNotEmpty()
    line: string;

    @ApiProperty({
        example: "Section 1"
    })
    @IsString()
    @IsNotEmpty()
    name: string;
}
