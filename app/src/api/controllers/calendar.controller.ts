import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ICalendarService } from "../../calendar-service/ICalendarService";
import { CALENDAR_SERVICE } from "../../calendar-service/ioc";
import { CalendarPresentation } from "../dto/calendar/calendarPresentation.dto";
import { DisabledDatesBody } from "../dto/calendar/disabledDayBody.dto";
import { AzureADGuard } from "../guards/auth.guard";

@ApiTags("Calendar")
@ApiBearerAuth()
@Controller("calendar")
@UseGuards(AzureADGuard)
export class CalendarController {
    constructor(
        @Inject(CALENDAR_SERVICE)
        private readonly calendarService: ICalendarService
    ) {}

    @Get(":locationId")
    @ApiOperation({ summary: "Get reserved and disabled dates" })
    @ApiOkResponse({ type: CalendarPresentation })
    async getReservedAndDisabledDates(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string
    ): Promise<CalendarPresentation> {
        await this.calendarService.getReservedAndDisabledDates(locationId);
    }

    @Put(":locationId/disabled-dates")
    @ApiOperation({ summary: "Create or update disabled dates" })
    @ApiOkResponse({ type: CalendarPresentation })
    async addOrUpdateDisabledDays(
        @Param("locationId", new ParseUUIDPipe({ version: "4" })) locationId: string,
        @Body() body: DisabledDatesBody
    ): Promise<CalendarPresentation> {
        await this.calendarService.addOrUpdateDisabledDates(locationId, body.disabledDates);
    }
}
