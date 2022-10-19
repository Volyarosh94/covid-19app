import { BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as Moment from "moment";
import { extendMoment } from "moment-range";
import { Between, Not, Repository } from "typeorm";
import { convertTimeToDate } from "../../utils/util";
import { BOOKING_STATUS_TYPE } from "../contract/bookingStatusType";
import { BookingValidationParams } from "../contract/bookingValidationParams";
import { BookingEntity } from "../entity/booking.entity";

const moment = extendMoment(Moment);

export class BookingValidator {
    constructor(
        @InjectRepository(BookingEntity)
        private readonly bookingRepository: Repository<BookingEntity>
    ) {}

    validateTimeFormat(newBookingStartTime: string, newBookingEndTime: string): boolean {
        const isValidBookingTime =
            convertTimeToDate(newBookingStartTime).isValid() && convertTimeToDate(newBookingEndTime).isValid();

        if (!isValidBookingTime) {
            throw new BadRequestException("Invalid Booking time");
        }

        return isValidBookingTime;
    }

    validateBookingStartDate(newBookingStartDate: string, newBookingEndDate: string): boolean {
        const isValid = moment(newBookingStartDate).valueOf() <= moment(newBookingEndDate).valueOf();

        if (!isValid) {
            throw new BadRequestException("Booking start date should be less than booking end date");
        }

        return isValid;
    }

    validateBookingStartTime(newBookingStartTime: string, newBookingEndTime: string): boolean {
        const isValid =
            convertTimeToDate(newBookingStartTime).valueOf() < convertTimeToDate(newBookingEndTime).valueOf();

        if (!isValid) {
            throw new BadRequestException("Booking start time should be less than booking end time");
        }

        return isValid;
    }

    async validateBookingExistence(params: BookingValidationParams) {
        const { dateFrom, dateTo, timeFrom, timeTo, locationId, userId } = params;
        const newBookingStartDate = moment(new Date(`${moment(dateFrom).format("YYYY-MM-DD")} ${timeFrom}`));
        const newBookingEndDate = moment(new Date(`${moment(dateTo).format("YYYY-MM-DD")} ${timeTo}`));
        const newBookingRange = moment.range(newBookingStartDate, newBookingEndDate);

        const existingBooking = await this.bookingRepository.findOne({
            where: {
                location: locationId,
                status: Not(BOOKING_STATUS_TYPE.CANCELED),
                dateFrom: Between(newBookingStartDate.startOf("day"), newBookingEndDate.endOf("day")),
                user: userId
            }
        });

        if (existingBooking) {
            const oldBookingStartDate = moment(
                `${moment(existingBooking.dateFrom).format("YYYY-MM-DD")} ${existingBooking.timeFrom}`
            );
            const oldBookingEndDate = moment(
                `${moment(existingBooking.dateTo).format("YYYY-MM-DD")} ${existingBooking.timeTo}`
            );
            const oldBookingRange = moment.range(oldBookingStartDate, oldBookingEndDate);

            if (oldBookingRange.overlaps(newBookingRange)) {
                throw new BadRequestException("Booking already exists");
            }
        }

        return true;
    }
}
