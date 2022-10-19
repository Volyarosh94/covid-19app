import { ApiProperty } from "@nestjs/swagger";
import { UsersNotificationsPresentation } from "./usersNotificationsPresentation.dto";

export class UserNotificationsPaginationPresentation {
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

    @ApiProperty({ type: [UsersNotificationsPresentation] })
    notifications: UsersNotificationsPresentation[];
}
