import { Drawing } from "../../location-service/contract/floorSchema";
import { DESK_STATUS_TYPE } from "./deskStatusType";

export interface DeskCreateOrUpdateRequest {
    id?: string;
    name?: string;
    sectionId?: number;
    section?: string;
    status?: DESK_STATUS_TYPE;
    owner?: string;
    resourceIds?: string[];
    deskSchema: Drawing;
    emails?: string[];
}
