import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import * as uuid from "uuid";
import { BookingIsBetweenDateTimeParams } from "../booking-service/contract/bookingIsBetweenDateTimeParams";
import { BookingIsSameDateTimeParams } from "../booking-service/contract/bookingIsSameDateTimeParams";
import { BOOKING_STATUS_TYPE } from "../booking-service/contract/bookingStatusType";
import { DESK_STATUS_TYPE } from "../desk-service/contract/deskStatusType";
import {
    convertWeekDayToWeeklyBookingDates,
    isBetweenDateRangeOrOverlap,
    isSameDateTimeOrOverlap
} from "../utils/util";
import { File } from "./contract/file";
import { FloorMapImage } from "./contract/floorMapImage";
import { FloorQueryParams } from "./contract/floorQueryParams";
import { FloorSchema, Size } from "./contract/floorSchema";
import { FloorWithLocation } from "./contract/floorWithLocation";
import { LocationCreateRequest } from "./contract/locationCreateRequest";
import { LocationFloorWithDesksCountAdmin } from "./contract/locationFloorWithDesksCountAdmin";
import { LocationFloorWithAvailableDesksCount } from "./contract/locationFloorWithTotalDesksAndSitsCount";
import { FloorMapEntity } from "./entity/floorMap.entity";
import { FloorSchemaEntity } from "./entity/floorSchema.entity";
import { LocationEntity } from "./entity/location.entity";
import { LocationFloorEntity } from "./entity/locationFloor.entity";

@Injectable()
export class LocationMapper {
    mapCreateRequestToEntity(request: LocationCreateRequest): LocationEntity {
        let location = new LocationEntity();
        location.id = uuid.v4();
        location.locationName = request.locationName;
        location.locationAddress = request.locationAddress;
        location.country = request.country;
        location.city = request.city;
        location.region = request.region;
        location.createdAt = new Date();
        location.timezone = request.timezone;
        return location;
    }

    mapToFloorWithSitsCountAdmin(entity: LocationFloorEntity): LocationFloorWithDesksCountAdmin {
        return {
            id: entity.id,
            floorName: entity.floorName,
            location: entity.location,
            availableDesks: entity.desks.filter((assignedDesk) => {
                return assignedDesk.status == DESK_STATUS_TYPE.AVAILABLE;
            }).length,
            assignedDesks: entity.desks.filter((assignedDesk) => {
                return assignedDesk.status == DESK_STATUS_TYPE.APPROVAL_REQUIRED;
            }).length,
            totalDesks: entity.desks.length
        };
    }

    mapToFloorWithAvailableDesksCount(
        entity: LocationFloorEntity,
        query?: FloorQueryParams
    ): LocationFloorWithAvailableDesksCount {
        let bookedDesks = 0;

        if (query) {
            const { custom, daily, weekly } = query;

            // filter desks by selected amenities
            if (!!query.resources?.length) {
                entity.desks = entity.desks.filter((desk) =>
                    query.resources.every((name) => {
                        const resource = desk.deskResources.find(({ resource }) => resource.name === name);
                        return resource ? true : false;
                    })
                );
            }

            entity.desks?.forEach((item) => {
                if (custom) {
                    const booking = item.bookings?.find((b) => {
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
                            return moment(b.dateFrom).isSame(custom.dateFrom);
                        }
                    });
                    bookedDesks = booking ? bookedDesks + 1 : bookedDesks;
                }

                if (daily) {
                    const now = moment().format("YYYY-MM-DD");
                    const booking = item.bookings?.find((b) => {
                        return (
                            b.status !== BOOKING_STATUS_TYPE.CANCELED &&
                            isSameDateTimeOrOverlap({
                                oldBookingStartDate: b.dateFrom,
                                newBookingStartDate: now,
                                newBookingStartTime: daily.timeFrom,
                                newBookingEndTime: daily.timeTo,
                                oldBookingStartTime: b.timeFrom,
                                oldBookingEndTime: b.timeTo
                            })
                        );
                    });

                    bookedDesks = booking ? bookedDesks + 1 : bookedDesks;
                }

                if (!!weekly?.length) {
                    weekly.forEach((w) => {
                        const weeklyBookingDates = convertWeekDayToWeeklyBookingDates(w.weekDay);
                        const booking = weeklyBookingDates.find(({ dateFrom }) => {
                            const currentDate = moment(dateFrom).format("YYYY-MM-DD");
                            return item.bookings?.find((b) => {
                                if (w.timeFrom && w.timeTo) {
                                    return (
                                        b.status !== BOOKING_STATUS_TYPE.CANCELED &&
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
                        bookedDesks = booking ? bookedDesks + 1 : bookedDesks;
                    });
                }
            });
        }

        return {
            id: entity.id,
            floorName: entity.floorName,
            sitDesks: bookedDesks > 0 ? entity.desks.length - bookedDesks : entity.desks?.length,
            location: entity.location
        };
    }

    mapToFloorSchemaEntity(floor: FloorWithLocation, size: Size): FloorSchemaEntity {
        const schemaId = uuid.v4();
        return {
            id: schemaId,
            floor,
            schema: {
                id: schemaId,
                drawings: [],
                floorId: floor.id,
                floorName: floor.floorName,
                mapUrl: `/api/locations/${floor.id}/floor-map`,
                size
            }
        };
    }

    mapToFloorMapImageEntity(file: File, floor: FloorWithLocation): FloorMapEntity {
        return {
            id: uuid.v4(),
            buffer: file.buffer,
            mimetype: file.mimetype,
            encoding: file.encoding,
            fieldname: file.fieldname,
            originalname: file.originalname,
            size: file.size,
            floor
        };
    }

    mapToFloorMapImage(entity: FloorMapEntity): FloorMapImage {
        return {
            id: entity.id,
            buffer: entity.buffer.toString("base64"),
            encoding: entity.encoding,
            fieldname: entity.fieldname,
            mimetype: entity.mimetype,
            originalname: entity.originalname,
            size: entity.size,
            floorId: entity.floor.id
        };
    }

    mapToSchemaContract(entity: FloorSchemaEntity): FloorSchema {
        return {
            id: entity.id,
            floorName: entity.floor.floorName,
            floorId: entity.floor.id,
            size: entity.schema.size,
            drawings: entity.schema.drawings.map((drawing) => {
                const desk = entity.floor?.desks?.find((desk) => desk.id == drawing.deskId);
                return {
                    ...drawing,
                    approvers: desk && !!desk.approvers.length ? desk.approvers : []
                };
            }),
            mapUrl: entity.schema.mapUrl
        };
    }

    mapEntityToLocationAddresses(entity: LocationEntity): string {
        return `${entity.locationAddress}`;
    }
}
