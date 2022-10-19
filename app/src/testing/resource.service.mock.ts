import { IResourceService } from "../resource-service/IResourceService";

export const mockResourceService = (): IResourceService => ({
    getLocationResources: jest.fn(),
    getResourceById: jest.fn(),
    removeResource: jest.fn(),
    updateResource: jest.fn(),
    addDefaultResources: jest.fn()
});
