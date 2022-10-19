import { Injectable } from "@nestjs/common";
import { AdUser } from "./contract/adUser";
import { ADUserEntity } from "./entity/adUser.entity";
import { UserEntity } from "./entity/user.entity";

@Injectable()
export class UserMapper {
    mapFromAdUserEntityToUserProfile(entity: ADUserEntity): AdUser {
        return {
            id: entity.id,
            businessPhones: entity.businessPhones,
            displayName: entity.displayName,
            givenName: entity.givenName,
            jobTitle: entity.jobTitle,
            mail: entity.mail,
            mobilePhone: entity.mobilePhone,
            officeLocation: entity.officeLocation,
            preferredLanguage: entity.preferredLanguage,
            surname: entity.surname,
            userPrincipalName: entity.userPrincipalName
        };
    }

    mapADUserToUserEntity(adUser: AdUser): UserEntity {
        return {
            id: adUser.id,
            email: adUser.mail.toLowerCase(), // AD user emails are stored with camel case
            name: `${adUser.givenName} ${adUser.surname}`,
            mobilePhone: adUser.mobilePhone,
            location: "13th Street 47 W 13th St, New York, USA, North America",
            deviceTokens: []
        };
    }
}
