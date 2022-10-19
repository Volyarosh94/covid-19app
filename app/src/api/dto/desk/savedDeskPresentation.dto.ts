import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";
import { FloorPresentation } from "../location/floorPresentation.dto";
import { LocationPresentation } from "../location/locationPresentation.dto";
import { DeskPresentation } from "./deskPresentation.dto";

export class SavedDeskPresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    id: string;

    @ApiProperty({
        example: uuid.v4()
    })
    userId: string;

    @ApiProperty({ type: LocationPresentation })
    location: LocationPresentation;

    @ApiProperty({ type: FloorPresentation })
    floor: FloorPresentation;

    @ApiProperty({ type: DeskPresentation })
    desk: DeskPresentation;
}
