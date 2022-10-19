import { Body, Controller, Get, HttpStatus, Inject, Post, UseFilters, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { USER_SERVICE } from "../../user-service/ioc";
import { IUserService } from "../../user-service/IUserService";
import { UserId } from "../decorators/user.decorator";
import { DeviceTokenBody } from "../dto/user/deviceTokenBody.dto";
import { UserProfilePresentation } from "../dto/user/userProfilePresentation.dto";
import { AzureAccessExceptionFilter } from "../filters/azureAccessExceptionFilter";
import { AzureADGuard } from "../guards/auth.guard";
import { UserPresentationMapper } from "../mappers/userPresentation.mapper";
import { UserNotFoundHttpException } from "../exceptions/userNotFoundHttpException";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(AzureADGuard)
@Controller("users")
@UseFilters(AzureAccessExceptionFilter)
export class UserController {
    constructor(
        @Inject(USER_SERVICE) private readonly userService: IUserService,
        private readonly mapper: UserPresentationMapper
    ) {}

    @Get("/profile")
    @ApiOperation({ summary: "Get user profile" })
    @ApiOkResponse({ type: UserProfilePresentation })
    async getProfile(@UserId() userId: string): Promise<UserProfilePresentation> {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new UserNotFoundHttpException(userId);
        }
        return this.mapper.mapToPresentation(user);
    }

    @Post()
    @ApiOperation({ summary: "Add new user" })
    @ApiOkResponse({ status: HttpStatus.OK })
    async addUser(@UserId() userId: string, @Body() body: DeviceTokenBody): Promise<void> {
        return this.userService.addUser(userId, body.deviceToken);
    }
}
