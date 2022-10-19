import { ApiProperty } from "@nestjs/swagger";
import * as uuid from "uuid";
import { NotificationRecipientType } from "../../../notification-service/contract/notificationRecipientType";
import { NOTIFICATION_STATUS_TYPE } from "../../../notification-service/contract/notificationStatusType";

export class NotificationPresentation {
    @ApiProperty({
        example: uuid.v4()
    })
    id: string;

    @ApiProperty({
        example: "Subject_1"
    })
    subject: string;

    @ApiProperty({
        example: "notification_message"
    })
    message: string;

    @ApiProperty({
        example: new Date()
    })
    sendDate: Date;

    @ApiProperty({
        example: uuid.v4()
    })
    locationId: string;

    @ApiProperty({
        example: NOTIFICATION_STATUS_TYPE.SENT
    })
    status: NOTIFICATION_STATUS_TYPE;

    @ApiProperty({
        example: NotificationRecipientType.ALL
    })
    recipients: NotificationRecipientType;

    @ApiProperty({
        example: new Date("2021-05-10")
    })
    startDate: Date;

    @ApiProperty({
        example: new Date("2021-05-15")
    })
    endDate: Date;

    @ApiProperty({
        example: new Date()
    })
    createdAt: Date;
}
