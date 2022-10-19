import { UserProfilePresentation } from "../../../api/dto/user/userProfilePresentation.dto";
import { UserEntity } from "../../../user-service/entity/user.entity";

export const mockUserEntity: UserEntity = {
    id: "userId",
    email: "sample@com",
    mobilePhone: "+123 45 67 890",
    name: "Test User",
    location: "default_location",
    deviceTokens: [
        {
            id: "token_id",
            deviceToken: "mock_token",
            user: { id: "userId" } as UserEntity
        }
    ]
};

export const mockUserProfile: UserProfilePresentation = {
    id: "userId",
    name: "Test User",
    email: "sample@com",
    mobilePhone: "+123 45 67 890",
    location: "default_location"
};
