import * as moment from "moment";
import { BookingIsBetweenDateTimeParams } from "../../booking-service/contract/bookingIsBetweenDateTimeParams";
import { BookingIsSameDateTimeParams } from "../../booking-service/contract/bookingIsSameDateTimeParams";
import { BOOKING_STATUS_TYPE } from "../../booking-service/contract/bookingStatusType";
import { DeskQueryParams } from "../../desk-service/contract/deskQueryParams";
import { DeskEntity } from "../../desk-service/entity/desk.entity";
import { SavedDeskEntity } from "../../desk-service/entity/savedDesk.entity";
import {
    convertWeekDayToWeeklyBookingDates,
    isBetweenDateRangeOrOverlap,
    isSameDateTimeOrOverlap
} from "../../utils/util";
import { DeskPresentation } from "../dto/desk/deskPresentation.dto";
import { SavedDeskPresentation } from "../dto/desk/savedDeskPresentation.dto";

export class DeskPresentationMapper {
    mapToDeskPresentation(entity: DeskEntity, isBooked = false): DeskPresentation {
        return {
            id: entity.id,
            name: entity.name,
            owner: entity.owner,
            section: entity.section,
            sectionId: entity.sectionId,
            floorId: entity.floor.id,
            status: entity.status,
            isBooked,
            resources: entity.deskResources?.map(({ resource }) => ({
                id: resource.id,
                name: resource.name,
                isAvailable: resource.isAvailable,
                locationId: resource.location.id,
                createdAt: resource.createdAt
            }))
        };
    }

    mapToBookedDeskPresentation(item: DeskEntity, query: DeskQueryParams): DeskPresentation {
        const { custom, daily, weekly } = query;
        const bookings = item.bookings;
        let isBooked: boolean;

        if (!bookings.length) {
            isBooked = false;
        } else {
            if (custom) {
                isBooked = Boolean(
                    bookings.find((b) => {
                        const params: BookingIsSameDateTimeParams & BookingIsBetweenDateTimeParams = {
                            newBookingStartDate: custom.dateFrom,
                            newBookingEndDate: custom.dateTo,
                            newBookingStartTime: custom.timeFrom,
                            newBookingEndTime: custom.timeTo,
                            oldBookingStartDate: b.dateFrom,
                            oldBookingStartTime: b.timeFrom,
                            oldBookingEndTime: b.timeTo
                        };

                        if (custom.timeFrom && custom.timeTo) {
                            return (
                                b.status !== BOOKING_STATUS_TYPE.CANCELED &&
                                (isSameDateTimeOrOverlap({ ...params, newBookingStartDate: custom.dateFrom }) ||
                                    isSameDateTimeOrOverlap({ ...params, newBookingStartDate: custom.dateTo }) ||
                                    isBetweenDateRangeOrOverlap(params))
                            );
                        } else {
                            return (
                                b.status !== BOOKING_STATUS_TYPE.CANCELED && moment(b.dateFrom).isSame(custom.dateFrom)
                            );
                        }
                    })
                );
            }

            if (daily) {
                const now = moment().format("YYYY-MM-DD");
                isBooked = Boolean(
                    bookings.find(
                        (b) =>
                            b.status !== BOOKING_STATUS_TYPE.CANCELED &&
                            isSameDateTimeOrOverlap({
                                oldBookingStartDate: b.dateFrom,
                                newBookingStartDate: now,
                                newBookingStartTime: daily.timeFrom,
                                newBookingEndTime: daily.timeTo,
                                oldBookingStartTime: b.timeFrom,
                                oldBookingEndTime: b.timeTo
                            })
                    )
                );
            }

            if (weekly && !!weekly.length) {
                isBooked = Boolean(
                    weekly.find((w) => {
                        const weeklyBookingDates = convertWeekDayToWeeklyBookingDates(w.weekDay);
                        return weeklyBookingDates.find(({ dateFrom }) => {
                            const currentDate = moment(dateFrom).format("YYYY-MM-DD");
                            return bookings.find((b) => {
                                if (w.timeFrom && w.timeTo) {
                                    return (
                                        b.status == BOOKING_STATUS_TYPE.BOOKED &&
                                        isSameDateTimeOrOverlap({
                                            oldBookingStartDate: b.dateFrom,
                                            newBookingStartDate: currentDate,
                                            newBookingStartTime: w.timeFrom,
                                            newBookingEndTime: w.timeTo,
                                            oldBookingStartTime: b.timeFrom,
                                            oldBookingEndTime: b.timeTo
                                        })
                                    );
                                } else {
                                    return moment(b.dateFrom).isSame(currentDate);
                                }
                            });
                        });
                    })
                );
            }
        }

        return this.mapToDeskPresentation(item, isBooked);
    }

    mapToSavedDeskPresentation(entity: SavedDeskEntity): SavedDeskPresentation {
        return {
            id: entity.id,
            desk: {
                id: entity.desk.id,
                name: entity.desk.name,
                owner: entity.desk.owner,
                section: entity.desk.section,
                sectionId: entity.desk.sectionId,
                floorId: entity.floor.id,
                status: entity.desk.status,
                resources: entity.desk.deskResources?.map(({ resource }) => ({
                    id: resource.id,
                    name: resource.name,
                    isAvailable: resource.isAvailable,
                    locationId: resource.location.id,
                    createdAt: resource.createdAt
                }))
            },
            floor: {
                id: entity.floor.id,
                floorName: entity.floor.floorName,
                locationId: entity.location.id
            },
            location: entity.location,
            userId: entity.userId
        };
    }
}
