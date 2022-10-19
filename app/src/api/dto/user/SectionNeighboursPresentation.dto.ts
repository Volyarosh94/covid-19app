import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class SectionNeighboursPresentation{
   
    @ApiProperty({ example: uuid.v4() })
    id: string;
    
    @ApiProperty({ example: "Megan" })
    name: string;

    @ApiProperty({ example: "Bowen" })
    surname: string;

    @ApiProperty({ example: uuid.v4() })
    deskId: string;

     @ApiProperty({ example: 14 })
    sectionId: number;    

}
