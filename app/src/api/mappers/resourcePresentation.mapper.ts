import { ResourceEntity } from "../../resource-service/entity/resource.entity";
import { ResourcePresentation } from "../dto/resource/resourcePresentation.dto";

export class ResourcePresentationMapper {
    mapToPresentation(entity: ResourceEntity): ResourcePresentation {
        return {
            id: entity.id,
            locationId: entity.location.id,
            name: entity.name,
            isAvailable: entity.isAvailable,
            createdAt: entity.createdAt
        };
    }
}
