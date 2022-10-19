import { DESK_STATUS_TYPE } from "../../desk-service/contract/deskStatusType";
import { DeskApproverEntity } from "../../desk-service/entity/deskApprover.entity";

export interface Size {
    width: number;
    height: number;
}

interface Coordinate {
    x: number;
    y: number;
}

export enum DrawingType {
    SECTION = "Section",
    DESK = "Desk"
}

export interface Drawing {
    type: DrawingType;
    sectionId?: number;
    deskId?: string;
    fill: string;
    coordinates: Coordinate[];
    line: string;
    name: string;
    status?: DESK_STATUS_TYPE;
    owner?: string;
    resourceIds?: string[];
    approvers?: DeskApproverEntity[];
}

export interface FloorSchema {
    id: string;
    floorName: string;
    floorId: string;
    size: Size;
    drawings: Drawing[];
    mapUrl: string;
}
