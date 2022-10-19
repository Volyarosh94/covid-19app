import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";

export class NotificationIdPresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    id: string;
}
