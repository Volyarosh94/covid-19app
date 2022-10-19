import { ResourceEntity } from "./entity/resource.entity";

export interface IResourceService {
    getLocationResources(locationId: string): Promise<ResourceEntity[]>;
    removeResource(resourceId: string): Promise<string>;
    getResourceById(resourceId: string): Promise<ResourceEntity>;
    updateResource(resourceId: string, isAvailable: boolean): Promise<ResourceEntity>;
    addDefaultResources(locationId: string): Promise<void>;
}
