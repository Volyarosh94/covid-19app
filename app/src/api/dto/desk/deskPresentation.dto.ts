import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import * as uuid from "uuid";
import { DESK_STATUS_TYPE } from "../../../desk-service/contract/deskStatusType";
import { ResourcePresentation } from "../resource/resourcePresentation.dto";

export class DeskPresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    id: string;

    @ApiProperty({
        example: "Desk 114"
    })
    name: string;

    @ApiProperty({
        example: 2
    })
    sectionId: number;

    @ApiProperty({
        example: "Section 2"
    })
    section: string;

    @ApiProperty({ example: uuid.v4() })
    floorId: string;

    @ApiProperty({ example: uuid.v4() })
    owner: string;

    @ApiProperty({ example: DESK_STATUS_TYPE.AVAILABLE })
    status: DESK_STATUS_TYPE;

    @ApiPropertyOptional({ type: [ResourcePresentation] })
    resources?: ResourcePresentation[];

    @ApiPropertyOptional({
        example: false
    })
    isBooked?: boolean;
}
