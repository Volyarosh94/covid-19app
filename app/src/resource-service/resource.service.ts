import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ResourceEntity } from "./entity/resource.entity";
import { IResourceService } from "./IResourceService";

const defaultResources = [
    {
        name: "Stands",
        isAvailable: true
    },
    {
        name: "Monitor",
        isAvailable: true
    },
    {
        name: "Dual Monitor",
        isAvailable: true
    },
    {
        name: "Docking Station",
        isAvailable: true
    },
    {
        name: "Dedicated PC",
        isAvailable: true
    },
    {
        name: "Multimedia Workstation",
        isAvailable: true
    }
];

@Injectable()
export class ResourceService implements IResourceService {
    constructor(
        @InjectRepository(ResourceEntity)
        private readonly resourceRepository: Repository<ResourceEntity>
    ) {}

    async getLocationResources(locationId: string): Promise<ResourceEntity[]> {
        await this.resourceRepository.find({
            where: { location: locationId },
            relations: ["location"],
            order: {
                createdAt: "ASC"
            }
        });
    }

    async getResourceById(resourceId: string): Promise<ResourceEntity> {
        const entity = await this.resourceRepository.findOne(resourceId, { relations: ["location"] });
        return entity ? entity : null;
    }

    async updateResource(resourceId: string, isAvailable: boolean): Promise<ResourceEntity> {
        const resource = await this.getResourceById(resourceId);

        if (!resource) {
            return null;
        }

        resource.isAvailable = isAvailable;
        await this.resourceRepository.save(resource);
    }

    async removeResource(resourceId: string): Promise<string> {
        await this.resourceRepository.delete(resourceId);
        return resourceId;
    }

    async addDefaultResources(locationId: string): Promise<void> {
        await Promise.all(
            defaultResources.map((item) => {
                this.resourceRepository.save(
                    this.resourceRepository.create({ ...item, location: { id: locationId }, createdAt: new Date() })
                );
            })
        );
    }
}
