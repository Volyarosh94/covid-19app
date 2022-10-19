import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import * as uuid from "uuid";
import { DESK_STATUS_TYPE } from "../../../desk-service/contract/deskStatusType";
import { DrawingType } from "../../../location-service/contract/floorSchema";
import { CoordinateBody } from "./coordinateBody.dto";

export class DrawingPresentation {
    @ApiProperty({
        example: DrawingType.DESK
    })
    type: DrawingType;
    @ApiPropertyOptional()
    sectionId?: number;
    @ApiPropertyOptional({
        example: uuid.v4()
    })
    deskId?: string;
    @ApiProperty({
        type: [CoordinateBody]
    })
    coordinates: CoordinateBody[];
    @ApiProperty({
        example: "#484766cc"
    })
    line: string;
    @ApiProperty({
        example: "Desk 115"
    })
    name: string;
    @ApiProperty({
        example: "#484766cc"
    })
    fill: string;
    @ApiProperty({
        example: uuid.v4()
    })
    owner?: string;
    @ApiProperty({
        example: DESK_STATUS_TYPE.AVAILABLE
    })
    status?: DESK_STATUS_TYPE;
    @ApiProperty({
        example: [uuid.v4()]
    })
    resourceIds?: string[];
}
