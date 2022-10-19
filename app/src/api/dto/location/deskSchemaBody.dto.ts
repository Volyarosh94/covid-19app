import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import * as uuid from "uuid";
import { DESK_STATUS_TYPE } from "../../../desk-service/contract/deskStatusType";
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
    @IsString()
    @IsOptional()
    deskId: string;
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
    @ApiProperty({
        example: DESK_STATUS_TYPE.AVAILABLE
    })
    @IsEnum(DESK_STATUS_TYPE)
    @IsNotEmpty()
    status: DESK_STATUS_TYPE;
    @ApiPropertyOptional({
        example: uuid.v4()
    })
    @IsUUID("4")
    owner: string;
    @ApiPropertyOptional({
        example: [uuid.v4()]
    })
    @IsArray()
    @IsString({ each: true })
    resourceIds: string[];
}
