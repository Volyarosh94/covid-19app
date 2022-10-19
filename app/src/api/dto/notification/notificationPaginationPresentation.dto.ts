import { ApiProperty } from "@nestjs/swagger";
import { NotificationPresentation } from "./notificationPresentation.dto";

export class NotificationPaginationPresentation {
    @ApiProperty({
        example: 3
    })
    page: number;

    @ApiProperty({
        example: 10
    })
    limit: number;

    @ApiProperty({
        example: 20
    })
    totalPages: number;

    @ApiProperty({ type: [NotificationPresentation] })
    notifications: NotificationPresentation[];
}
