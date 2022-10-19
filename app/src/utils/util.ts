import * as moment from "moment";
import { extendMoment } from "moment-range";
import * as momentTimeZone from "moment-timezone";
import { BookingDates } from "../booking-service/contract/bookingDates";
import { BookingIsBetweenDateTimeParams } from "../booking-service/contract/bookingIsBetweenDateTimeParams";
import { BookingIsSameDateTimeParams } from "../booking-service/contract/bookingIsSameDateTimeParams";

const momentRange = extendMoment(moment);
export const WEEK_RANGE = 7;
export const DAY = 24 * 3600 * 1000;
export const TWO_WEEKS_RANGE = 14;
export const START_DAY = moment(new Date()).valueOf() + DAY;
export const defaultDate = moment(new Date()).utc().format("YYYY-MM-DD");

export const convertTimeToDate = (time: string) => moment(time, "HH:mm").utc();

export const isSameDateTimeOrOverlap = (params: BookingIsSameDateTimeParams): boolean =>
    (moment(params.oldBookingStartDate).isSame(moment(params.newBookingStartDate)) &&
        moment(params.newBookingStartTime, "HH:mm:Z").isSame(moment(params.oldBookingStartTime, "HH:mm:Z")) &&
        moment(params.newBookingEndTime, "HH:mm:Z").isSame(moment(params.oldBookingEndTime, "HH:mm:Z"))) ||
    (moment(params.oldBookingStartDate).isSame(moment(params.newBookingStartDate)) &&
        isTimeOverlap(
            params.newBookingStartTime,
            params.newBookingEndTime,
            params.oldBookingStartTime,
            params.oldBookingEndTime
        ));

export const isTimeOverlap = (
    newBookingStartTime: string,
    newBookingEndTime: string,
    oldBookingStartTime: string,
    oldBookingEndTime: string
): boolean => {
    const oldBookingRange = momentRange.range(
        moment(oldBookingStartTime, "HH:mm:Z"),
        moment(oldBookingEndTime, "HH:mm:Z")
    );
    const newBookingRange = momentRange.range(
        moment(newBookingStartTime, "HH:mm:Z"),
        moment(newBookingEndTime, "HH:mm:Z")
    );
    return oldBookingRange.overlaps(newBookingRange);
};

export const isBetweenDateRangeOrOverlap = (params: BookingIsBetweenDateTimeParams) =>
    moment(new Date(params.oldBookingStartDate)).isBetween(
        moment(new Date(params.newBookingStartDate)),
        moment(new Date(params.newBookingEndDate))
    ) &&
    isTimeOverlap(
        params.newBookingStartTime,
        params.newBookingEndTime,
        params.oldBookingStartTime,
        params.oldBookingEndTime
    );

export const convertWeekDayToWeeklyBookingDates = (weekDay: string): BookingDates[] => {
    let firstDate = moment(moment(new Date()).day(weekDay).valueOf() + WEEK_RANGE * DAY);
    if (moment().valueOf() > firstDate.valueOf()) {
        firstDate = moment(firstDate.valueOf() + WEEK_RANGE * DAY);
    }

    let weeklyBookingDates: BookingDates[] = [];

    const FirstDateOfWeeklyBooking = firstDate.format("YYYY-MM-DDT00:00:00.000") + "Z";
    const SecondDateOfWeeklyBooking =
        moment(firstDate.valueOf() + WEEK_RANGE * DAY).format("YYYY-MM-DDT00:00:00.000") + "Z";

    weeklyBookingDates.push(
        { dateFrom: FirstDateOfWeeklyBooking, dateTo: FirstDateOfWeeklyBooking },
        { dateFrom: SecondDateOfWeeklyBooking, dateTo: SecondDateOfWeeklyBooking }
    );

    return weeklyBookingDates;
};

export const convertLocationTimeZoneDateTime = (timezone: string, date: Date): moment.Moment => {
    const offset = momentTimeZone.tz(timezone).utcOffset();

    const func = offset > 0 ? "subtract" : "add";

    let dateToTransform = moment.utc([
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
    ]);

    return dateToTransform[func](offset, "minutes");
};
