import { LocationFloorWithAvailableDesksCount } from "../../location-service/contract/locationFloorWithTotalDesksAndSitsCount";
import { LocationEntity } from "../../location-service/entity/location.entity";
import { LocationFloorEntity } from "../../location-service/entity/locationFloor.entity";
import { FloorPresentation } from "../dto/location/floorPresentation.dto";
import { FloorWithDesksAndSitsCountPresentation } from "../dto/location/floorWithDesksAndSitsCountPresentation.dto";
import { LocationPresentation } from "../dto/location/locationPresentation.dto";

export class LocationPresentationMapper {
    mapToLocationPresentation(entity: LocationEntity): LocationPresentation {
        let counter = { floors: 0, desks: 0 };
        if (!!entity.floorsEntity?.length) {
            counter["floors"] = entity.floorsEntity.length;
            counter["desks"] = 0;
            entity.floorsEntity.forEach((floor) => {
                if (floor.desks.length) {
                    counter["desks"] += floor.desks.length;
                } else {
                    counter["desks"] += 0;
                }
            });
        } else {
            counter["floors"] = 0;
            counter["desks"] = 0;
        }

        return {
            id: entity.id,
            locationName: entity.locationName,
            locationAddress: entity.locationAddress,
            businessHours: entity.businessHours,
            country: entity.country,
            city: entity.city,
            region: entity.region,
            desks: counter.desks,
            floors: counter.floors,
            createdAt: entity.createdAt,
            timezone: entity.timezone
        };
    }

    mapToFloorWithDesksAndSits(contract: LocationFloorWithAvailableDesksCount): FloorWithDesksAndSitsCountPresentation {
        return {
            id: contract.id,
            floorName: contract.floorName,
            sitDesks: contract.sitDesks
        };
    }

    mapToFloorPresentation(entity: LocationFloorEntity): FloorPresentation {
        return {
            id: entity.id,
            floorName: entity.floorName,
            locationId: entity.location.id
        };
    }
}
