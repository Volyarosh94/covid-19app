import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IBookingService } from "../booking-service/IBookingService";
import { ILocationService } from "../location-service/ILocationService";
import { LOCATION_SERVICE } from "../location-service/ioc";
import { INotificationService } from "../notification-service/INotificationService";
import { NOTIFICATION_SERVICE } from "../notification-service/ioc";
import { CalendarMapper } from "./calendar.mapper";
import { DisabledAndReservedDates } from "./contract/disabledAndReservedDates";
import { CalendarEntity } from "./entity/calendar.entity";
import { ICalendarService } from "./ICalendarService";
import { BookingService } from "../booking-service/booking.service";

@Injectable()
export class CalendarService implements ICalendarService {
    constructor(
        private readonly mapper: CalendarMapper,
        @Inject(forwardRef(() => BookingService))
        private readonly bookingService: IBookingService,
        @Inject(LOCATION_SERVICE)
        private readonly locationService: ILocationService,
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: INotificationService,
        @InjectRepository(CalendarEntity)
        private readonly calendarRepository: Repository<CalendarEntity>
    ) {}

    async getReservedAndDisabledDates(locationId: string): Promise<DisabledAndReservedDates> {
        let bookingDates = await this.bookingService.getBookingDatesByLocationId(locationId);
        let calendar = await this.calendarRepository.findOne({ where: { location: locationId } });
        const disabledDates = calendar ? calendar.disabledDates : [];
        let matchDates: string[] = [];
        if (!!disabledDates.length) {
            [matchDates, bookingDates] = this.mapper.mapToMatchDates(disabledDates, bookingDates);
            if (!!matchDates.length) {
                matchDates = [...new Set(matchDates)];
                await Promise.all([
                    matchDates.map((bookingId) => {
                        this.bookingService.cancelBooking(bookingId);
                        this.notificationService.sendCancelBookingByAdminNotification(bookingId);
                    })
                ]);
            }
        }
        return {
            reservedDates: bookingDates.map((date) => date.date),
            disabledDates
        };
    }

    async addOrUpdateDisabledDates(locationId: string, disabledDates: string[]): Promise<DisabledAndReservedDates> {
        const [entity, location] = await Promise.all([
            this.calendarRepository.findOne({ where: { location: locationId } }),
            this.locationService.getLocationById(locationId)
        ]);

        if (!entity) {
            const locationDisabledDates = this.calendarRepository.create();
            locationDisabledDates.location = location;
            locationDisabledDates.disabledDates = disabledDates;
            await this.calendarRepository.save(locationDisabledDates);
        } else {
            entity.disabledDates = disabledDates;
            await this.calendarRepository.save(entity);
        }

        return  this.getReservedAndDisabledDates(locationId);
    }

    async getDisabledDates(locationId: string): Promise<string[]>{
        const calendar = await this.calendarRepository.findOne({ where: { location: locationId } });
        return calendar ? calendar.disabledDates : [];
    }
}
