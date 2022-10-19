import { mockUserId } from "../../testing/booking/data/mockBookingData";
import { mockUserEntity, mockUserProfile } from "../../testing/user/data/mockUserData";
import { mockUserService } from "../../testing/user/user.service.mock";
import { IUserService } from "../../user-service/IUserService";
import { UserController } from "../controllers/user.controller";
import { UserPresentationMapper } from "../mappers/userPresentation.mapper";

describe("User Controller", () => {
    let controller: UserController;
    let userService: IUserService;
    let mapper: UserPresentationMapper;

    beforeEach(() => {
        mapper = new UserPresentationMapper();
        userService = mockUserService();
        controller = new UserController(userService, mapper);
    });

    describe("getProfile", () => {
        it("should return user profile info", async () => {
            const getProfileSpy = jest
                .spyOn(userService, "getUserById")
                .mockImplementationOnce(() => Promise.resolve(mockUserEntity));
            const profile = await controller.getProfile(mockUserId);

            expect(profile).toMatchObject(mockUserProfile);
            expect(profile.id).toEqual(mockUserId);
            expect(getProfileSpy).toBeCalledWith(mockUserId);
        });
    });
});
