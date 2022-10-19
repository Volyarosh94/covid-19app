import { DeskEntity } from "../../desk-service/entity/desk.entity";

export interface DeskApproverConfirmationEmailParams {
    email: string;
    desk: DeskEntity;
    token: string;
}
