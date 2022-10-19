import { IDeskService } from "../../desk-service/IDeskService";

export const mockDeskService = (): IDeskService => ({
    getDeskById: jest.fn(),
    insertOrUpdateDesk: jest.fn(),
    removeDesk: jest.fn(),
    getFloorDesks: jest.fn(),
    getAvailableDesksByDateTime: jest.fn(),
    getSavedDeskByDeskId: jest.fn(),
    getSavedDesks: jest.fn(),
    addDeskToSaved: jest.fn(),
    removeSavedDesk: jest.fn(),
    getSectionNeighbours: jest.fn(),
    confirmApproverEmail: jest.fn(),
    getApprovers: jest.fn()
});
