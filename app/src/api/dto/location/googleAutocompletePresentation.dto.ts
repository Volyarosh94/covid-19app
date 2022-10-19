import { ApiProperty } from "@nestjs/swagger";


export class GoogleAutocompletePresentation {
    @ApiProperty({
        example: "United States"
    })
    country: string;

    @ApiProperty({
        example: "New York"
    })
    locality: string;

    @ApiProperty({
        example: "North America"
    })
    region: string;
}
