import * as uuid from "uuid";
import { DeskPresentation } from "../../../api/dto/desk/deskPresentation.dto";
import { DESK_STATUS_TYPE } from "../../../desk-service/contract/deskStatusType";
import { DeskEntity } from "../../../desk-service/entity/desk.entity";
import { createMockLocation } from "../../location/data/mockLocationData";
import { mockUserEntity } from "../../user/data/mockUserData";

export const mockDeskId = "desk_id";
const location = createMockLocation();
const floorId = "floor_id";
const resourceId = "resource_id";
const deskResourceId = "desk_resource_id";

export const createMockDesk = (): DeskPresentation => ({
    id: mockDeskId,
    sectionId: 2,
    section: "Section 2",
    name: "Desk_1",
    status: DESK_STATUS_TYPE.AVAILABLE,
    floorId,
    owner: "userId",
    resources: [
        {
            id: resourceId,
            locationId: location.id,
            name: "Resource_1",
            isAvailable: true,
            createdAt: ("2021-05-11" as unknown) as Date
        }
    ]
});

export const createMockDeskEntity = (): DeskEntity => ({
    id: mockDeskId,
    floor: {
        id: floorId,
        floorName: "Floor_1",
        location
    },
    owner: "userId",
    sectionId: 2,
    section: "Section 2",
    name: "Desk_1",
    status: DESK_STATUS_TYPE.AVAILABLE,
    deskResources: [
        {
            id: deskResourceId,
            resource: {
                id: resourceId,
                location,
                name: "Resource_1",
                isAvailable: true,
                createdAt: ("2021-05-11" as unknown) as Date
            },
            desk: ({} as unknown) as DeskEntity
        }
    ]
});

export const createMockDeskJoinedWithBookingEntity = () => ({
    id: mockDeskId,
    floor: {
        id: floorId,
        floorName: "Floor_1",
        location
    },
    owner: "userId",
    section: 2,
    name: "Desk_1",
    status: DESK_STATUS_TYPE.AVAILABLE,
    deskResources: [
        {
            id: uuid.v4(),
            resource: {
                id: resourceId,
                location,
                name: "Resource_1",
                isAvailable: true,
                createdAt: ("2021-05-11" as unknown) as Date
            },
            desk: ({} as unknown) as DeskEntity
        }
    ],
    bookings: [
        {
            id: uuid.v4(),
            desk: {
                id: uuid.v4()
            } as DeskEntity,
            user: mockUserEntity
        }
    ]
});
