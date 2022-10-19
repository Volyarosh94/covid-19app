import { UserEntity } from "../../user-service/entity/user.entity";
import { UserProfilePresentation } from "../dto/user/userProfilePresentation.dto";

export class UserPresentationMapper {
    mapToPresentation(contract: UserEntity): UserProfilePresentation {
        return {
            id: contract.id,
            email: contract.email,
            name: contract.name,
            mobilePhone: contract.mobilePhone,
            location: contract.location
        };
    }
}
