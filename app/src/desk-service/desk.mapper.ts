import { Injectable } from "@nestjs/common";
import { BookingEntity } from "../booking-service/entity/booking.entity";
import { SectionNeighbour } from "../user-service/contract/sectionNeighbour";

@Injectable()
export class DeskMapper {
    mapFromUserEntityToUserNeighbour(entity: BookingEntity & { deskId: string }, sectionId: number): SectionNeighbour {
        const [name, surname] = entity.user.name.split(" ");
        return {
            id: entity.user.id,
            name,
            surname,
            sectionId: sectionId,
            deskId: entity.deskId
        };
    }
}
