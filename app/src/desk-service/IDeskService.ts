import { SectionNeighbour } from "../user-service/contract/sectionNeighbour";
import { DeskCreateOrUpdateRequest } from "./contract/deskCreateOrUpdateRequest";
import { DeskQueryParams } from "./contract/deskQueryParams";
import { SavedDeskCreateRequest } from "./contract/deskSavedCreateRequest";
import { DeskEntity } from "./entity/desk.entity";
import { DeskApproverEntity } from "./entity/deskApprover.entity";
import { SavedDeskEntity } from "./entity/savedDesk.entity";

export interface IDeskService {
    getDeskById(deskId: string): Promise<DeskEntity>;
    confirmApproverEmail(token: string): Promise<DeskApproverEntity>;
    insertOrUpdateDesk(floorId: string, body: DeskCreateOrUpdateRequest, sectionId?: string): Promise<DeskEntity>;
    getFloorDesks(floorId: string): Promise<DeskEntity[]>;
    removeDesk(deskId: string): Promise<void>;
    getAvailableDesksByDateTime(floorId: string, params: DeskQueryParams): Promise<DeskEntity[]>;
    addDeskToSaved(request: SavedDeskCreateRequest): Promise<SavedDeskEntity>;
    getSavedDeskByDeskId(deskId: string, userId: string): Promise<SavedDeskEntity>;
    getSavedDesks(userId: string): Promise<SavedDeskEntity[]>;
    removeSavedDesk(deskId: string, userId: string): Promise<void>;
    getSectionNeighbours(sectionId: number, params: DeskQueryParams): Promise<SectionNeighbour[]>;
    getApprovers(deskId: string): Promise<DeskApproverEntity[]>;
}
