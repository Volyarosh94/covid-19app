import { Test } from "@nestjs/testing";
import { IUserService } from "../IUserService";
import { MsGraphConfig } from "../msGraphConfig";
import { UserMapper } from "../user.mapper";
import { UserService } from "../user.service";
import Axios from "axios";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "../entity/user.entity";
import { mockRepository } from "../../testing/repository.mock";
import { DeviceTokenEntity } from "../entity/deviceToken.entity";

describe("UserService", () => {
    let userService: IUserService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: mockRepository
                },
                {
                    provide: MsGraphConfig,
                    useFactory: () => {
                        return {
                            clientId: "client_id",
                            tenantId: "tenant_id",
                            authTokenUrl: "token_url",
                            graphUrl: "graph_url",
                            clientSecret: "client_secret",
                            scope: "test_scope"
                        };
                    }
                },
                UserMapper,
                {
                    provide: getRepositoryToken(DeviceTokenEntity),
                    useValue: mockRepository
                }
            ]
        }).compile();

        userService = module.get(UserService);
    });

    it("should get AD user profile", async () => {
        const userId = "user_id";
        const client = Axios.create();

        const userProfile = {
            businessPhones: ["+1 412 555 0109"],
            displayName: "Megan Bowen",
            givenName: "Megan",
            jobTitle: "Auditor",
            mail: "MeganB@M365x214355.onmicrosoft.com",
            mobilePhone: null,
            officeLocation: "12/1110",
            preferredLanguage: "en-US",
            surname: "Bowen",
            userPrincipalName: "MeganB@M365x214355.onmicrosoft.com",
            id: "48d31887-5fad-4d73-a9f5-3c356e68a038"
        };

        jest.spyOn(userService, "msGraphClient").mockResolvedValueOnce(client);
        jest.spyOn(client, "get").mockImplementationOnce(() => Promise.resolve({ data: userProfile }));

        const result = await userService.getADUser(userId);
        expect(result).toMatchObject(userProfile);
    });
});
