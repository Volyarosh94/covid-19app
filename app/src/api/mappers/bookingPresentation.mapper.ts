import { BookingEntity } from "../../booking-service/entity/booking.entity";
import { convertTimeToDate } from "../../utils/util";
import { BookingPresentation } from "../dto/booking/bookingPresentation.dto";

export class BookingPresentationMapper {
    mapBookingToPresentation(data: BookingEntity): BookingPresentation {
        return {
            id: data.id,
            dateFrom: data.dateFrom,
            dateTo: data.dateFrom,
            timeFrom: convertTimeToDate(data.timeFrom).format("LT"),
            timeTo: convertTimeToDate(data.timeTo).format("LT"),
            userId: data.user.id,
            status: data.status,
            location: data.location,
            floor: {
                id: data.desk.floor.id,
                floorName: data.desk.floor.floorName,
                locationId: data.location.id
            },
            desk: {
                id: data.desk.id,
                name: data.desk.name,
                owner: data.desk.owner,
                section: data.desk.section,
                sectionId: data.desk.sectionId,
                floorId: data.desk.floor.id,
                status: data.desk.status,
                resources: data.desk.deskResources?.map(({ resource }) => ({
                    id: resource.id,
                    name: resource.name,
                    isAvailable: resource.isAvailable,
                    locationId: data.location.id,
                    createdAt: resource.createdAt
                }))
            },
            index: data.index,
            selected: data.selected,
            weekDay: data.weekDay,
            type: data.type,
            hasPassedQuestionnaire: data.hasPassedQuestionnaire
        };
    }
}
