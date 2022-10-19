import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { IDeskService } from "../../desk-service/IDeskService";
import { DESK_SERVICE } from "../../desk-service/ioc";
import { DeskApproverPresentation } from "../dto/desk/deskApproverPresentation.dto";

@ApiTags("Desk")
@Controller("desks")
export class DeskConfirmController {
    constructor(
        @Inject(DESK_SERVICE)
        private readonly deskService: IDeskService
    ) {}

    @Get("confirmApproverEmail")
    @ApiOperation({ summary: "Confirm approver email" })
    @ApiOkResponse({ type: DeskApproverPresentation })
    async confirmApproverEmail(@Query("token") token: string): Promise<DeskApproverPresentation> {
        return this.deskService.confirmApproverEmail(token);
    }
}
