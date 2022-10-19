import { Injectable } from "@nestjs/common";
import * as _ from "lodash";
import * as moment from "moment";
import * as uuid from "uuid";
import { convertWeekDayToWeeklyBookingDates, DAY, START_DAY, TWO_WEEKS_RANGE } from "../utils/util";
import { BookingCustomCreateRequest } from "./contract/bookingCustomCreateRequest";
import { BookingCustomDateTimeSlot } from "./contract/bookingCustomDateTimeSlot";
import { BookingDailyCreateRequest } from "./contract/bookingDailyCreateRequest";
import { BookingDates } from "./contract/bookingDates";
import { BookingIdWithDate } from "./contract/bookingIdwithDate";
import { BookingType } from "./contract/bookingType";
import { BookingWeeklyCreateRequest } from "./contract/bookingWeeklyCreateRequest";
import { QuestionnaireBooking } from "./contract/questionnaireBooking";
import { BookingEntity } from "./entity/booking.entity";

@Injectable()
export class BookingMapper {
    mapCreateRequestToCustomBookingEntity(request: BookingCustomCreateRequest): BookingEntity[] {
        if (!moment(request.dateFrom).isSame(request.dateTo)) {
            const dates = this.prepareBookingDates(moment(request.dateFrom).utc(), moment(request.dateTo).utc());
            return dates.map(
                (date): BookingEntity => {
                    return {
                        id: uuid.v4(),
                        dateFrom: date,
                        dateTo: date,
                        timeFrom: request.timeFrom,
                        timeTo: request.timeTo,
                        location: request.location,
                        type: BookingType.CUSTOM,
                        hasPassedQuestionnaire: null,
                        status: null,
                        user: null,
                        desk: null
                    };
                }
            );
        } else {
            return [
                {
                    id: uuid.v4(),
                    dateFrom: request.dateFrom,
                    dateTo: request.dateTo,
                    timeFrom: request.timeFrom,
                    timeTo: request.timeTo,
                    location: request.location,
                    type: BookingType.CUSTOM,
                    hasPassedQuestionnaire: null,
                    status: null,
                    user: null,
                    desk: null
                }
            ];
        }
    }

    mapCreateRequestToDailyBookingEntity(request: BookingDailyCreateRequest, disabledDates: string[]): BookingEntity[] {
        let dailyBookingDates: BookingDates[] = [];

        let dateFrom = moment(START_DAY).format("YYYY-MM-DDT00:00:00.000") + "Z";
        let dateTo = dateFrom;

        for (let i = 0; i < TWO_WEEKS_RANGE; i++) {
            if (i == 0) {
                dailyBookingDates.push({ dateFrom, dateTo });
            } else if (i == 1) {
                dateFrom = moment(new Date(START_DAY + DAY)).format("YYYY-MM-DDT00:00:00.000") + "Z";
                dateTo = dateFrom;
                dailyBookingDates.push({ dateFrom, dateTo });
            } else if (i > 1 && i <= TWO_WEEKS_RANGE) {
                dateFrom = moment(START_DAY + DAY * i).format("YYYY-MM-DDT00:00:00.000") + "Z";
                dateTo = dateFrom;
                dailyBookingDates.push({ dateFrom, dateTo });
            }
        }

        dailyBookingDates = this.excludeDisabledDates(dailyBookingDates, disabledDates);

        return dailyBookingDates.map(
            ({ dateFrom, dateTo }): BookingEntity => {
                return {
                    id: uuid.v4(),
                    dateFrom,
                    dateTo,
                    timeFrom: request.timeFrom,
                    timeTo: request.timeTo,
                    location: request.location,
                    type: BookingType.DAILY,
                    hasPassedQuestionnaire: null,
                    index: null,
                    selected: false,
                    weekDay: null,
                    desk: null,
                    status: null,
                    user: null
                };
            }
        );
    }

    mapCreateRequestToWeeklyBookingEntity(
        request: BookingWeeklyCreateRequest,
        disabledDates: string[]
    ): BookingEntity[] {
        let weeklyBookingDates = convertWeekDayToWeeklyBookingDates(request.weekDay);
        weeklyBookingDates = this.excludeDisabledDates(weeklyBookingDates, disabledDates);

        return weeklyBookingDates.map(
            ({ dateFrom, dateTo }): BookingEntity => {
                return {
                    id: uuid.v4(),
                    index: request.index,
                    selected: request.selected,
                    dateFrom,
                    dateTo,
                    timeFrom: request.timeFrom,
                    timeTo: request.timeTo,
                    weekDay: request.weekDay,
                    location: request.location,
                    type: BookingType.WEEKLY,
                    desk: null,
                    hasPassedQuestionnaire: null,
                    status: null,
                    user: null
                };
            }
        );
    }

    excludeDisabledDates(bookingDates: BookingDates[], disabledDates: string[]): BookingDates[] {
        if (disabledDates.length) {
            disabledDates.forEach((disabledDate) => {
                bookingDates.forEach((bookingDate) => {
                    if (
                        moment(moment(disabledDate).format("YYYY/MM/DD")).isSame(
                            moment(bookingDate.dateFrom).format("YYYY/MM/DD")
                        )
                    ) {
                        bookingDates = bookingDates.filter((date) => date !== bookingDate);
                    }
                });
            });
        }
        return bookingDates;
    }

    mapToCustomBookingBookedDateTimeSlot(bookings: BookingEntity[]): BookingCustomDateTimeSlot[] {
        let dateTimeSlots: BookingCustomDateTimeSlot[] = [];

        for (let i = 0; i < bookings.length; i++) {
            const date = bookings[i].dateFrom;
            let dateTimeSlot = {
                date: moment(bookings[i].dateFrom).format("YYYY-MM-DD"),
                slots: []
            };

            for (let j = i; j < bookings.length; j++) {
                const booking = bookings[j];
                if (moment(date).isSame(moment(booking.dateFrom))) {
                    dateTimeSlot.slots.push(`${booking.timeFrom} - ${booking.timeTo}`);
                }
            }
            dateTimeSlots.push(dateTimeSlot);
        }

        const groupedDateTimeSlotsByDate = _.groupBy(dateTimeSlots, "date");
        dateTimeSlots = [];

        for (const k in groupedDateTimeSlotsByDate) {
            const collection = groupedDateTimeSlotsByDate[k];
            let groupedTimeSlot: BookingCustomDateTimeSlot = {
                date: "",
                slots: []
            };

            for (let i = 0; i < collection.length; i++) {
                const data = collection[i];
                groupedTimeSlot.date = moment(data.date).format("YYYY-MM-DD");
                groupedTimeSlot.slots = groupedTimeSlot.slots.concat(data.slots);
            }
            dateTimeSlots.push({ ...groupedTimeSlot, slots: _.uniq(groupedTimeSlot.slots) });
        }

        return _.sortBy(dateTimeSlots, "date");
    }

    mapFromBookingToDates(bookings: BookingEntity[]): BookingIdWithDate[] {
        return bookings.map(({ dateFrom, id }) => ({ date: dateFrom, bookingId: id }));
    }

    mapToQuestionnaireBooking(entity: BookingEntity): QuestionnaireBooking {
        return {
            bookingId: entity.id,
            locationId: entity.location.id
        };
    }

    private prepareBookingDates(dateFrom: moment.Moment, dateTo: moment.Moment): string[] {
        let now = dateFrom.clone();
        let dates: string[] = [];

        while (now.isSameOrBefore(dateTo)) {
            dates.push(now.format("YYYY-MM-DD"));
            now.add(1, "days");
        }

        return dates;
    }
}
