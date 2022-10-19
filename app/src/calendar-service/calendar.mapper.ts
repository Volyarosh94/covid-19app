import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { BookingIdWithDate } from "../booking-service/contract/bookingIdwithDate";

@Injectable()
export class CalendarMapper {
    mapToMatchDates(disabledDates: string[], bookingDates: BookingIdWithDate[]) {
        const matchDates = [];
        disabledDates.forEach((disabledDate) => {
            bookingDates.forEach((bookingDate) => {
                if (
                    moment(moment(disabledDate).format("YYYY/MM/DD")).isSame(
                        moment(bookingDate.date).format("YYYY/MM/DD")
                    )
                ) {
                    matchDates.push(bookingDate.bookingId);
                    bookingDates = bookingDates.filter((date) => date !== bookingDate);
                }
            });
        });
        return [matchDates, bookingDates];
    }
}
