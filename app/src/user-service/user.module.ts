import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeviceTokenEntity } from "./entity/deviceToken.entity";
import { UserEntity } from "./entity/user.entity";
import { USER_SERVICE } from "./ioc";
import { MsGraphConfig } from "./msGraphConfig";
import { UserMapper } from "./user.mapper";
import { UserService } from "./user.service";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, DeviceTokenEntity])],
    providers: [
        {
            provide: USER_SERVICE,
            useClass: UserService
        },
        {
            provide: MsGraphConfig,
            useFactory: () => {
                return {
                    clientId: process.env.AZURE_CLIENT_ID,
                    tenantId: process.env.AZURE_TENANT_ID,
                    authTokenUrl: process.env.AZURE_AUTH_URL,
                    graphUrl: process.env.MICROSOFT_GRAPH_URL,
                    clientSecret: process.env.AZURE_CLIENT_SECRET,
                    scope: process.env.MICROSOFT_GRAPH_SCOPE
                };
            }
        },
        UserMapper
    ],
    exports: [
        {
            provide: USER_SERVICE,
            useClass: UserService
        }
    ]
})
export class UserModule {}
