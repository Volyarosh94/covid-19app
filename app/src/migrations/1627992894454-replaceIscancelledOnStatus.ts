import { MigrationInterface, QueryRunner } from "typeorm";
import { BookingEntity } from "../booking-service/entity/booking.entity";
import { BOOKING_STATUS_TYPE } from "../booking-service/contract/bookingStatusType";

export class replaceIscancelledOnStatus1627992894454 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const bookings = await queryRunner.manager.find(BookingEntity);
        ;

        const updatedBookings = bookings.map(booking => {
            booking["isCancelled"] ?
                booking.status = BOOKING_STATUS_TYPE.CANCELED :
                booking.status = BOOKING_STATUS_TYPE.BOOKED;
            return booking;
        });

        await queryRunner.manager.save(updatedBookings);
        // await queryRunner.dropColumn("BOOKINGS", "isCancelled");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("BOOKINGS", "status");
    }

}
