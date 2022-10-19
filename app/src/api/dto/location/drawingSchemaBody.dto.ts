import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { DrawingType } from "../../../location-service/contract/floorSchema";
import { CoordinateBody } from "./coordinateBody.dto";

export class DeskSchemaBody {
    @ApiProperty({
        example: DrawingType.DESK
    })
    @IsNotEmpty()
    @IsString()
    type: DrawingType;
    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    sectionId: number;
    @ApiPropertyOptional({
        example: 115
    })
    @IsNumber()
    @IsOptional()
    deskId: number;
    @ApiProperty({
        example: "#4847663b"
    })
    @IsString()
    @IsNotEmpty()
    fill: string;
    @ApiProperty({ type: [CoordinateBody] })
    @IsArray()
    @IsNotEmpty()
    coordinates: CoordinateBody[];
    @ApiProperty({
        example: "#484766cc"
    })
    @IsString()
    @IsNotEmpty()
    line: string;
    @ApiProperty({
        example: "Desk 112"
    })
    @IsString()
    @IsNotEmpty()
    name: string;
}
