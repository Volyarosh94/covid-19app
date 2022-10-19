import Axios, { AxiosInstance } from "axios";
import { AdUser } from "./contract/adUser";
import { IUserService } from "./IUserService";
import { MsGraphConfig } from "./msGraphConfig";
import * as qs from "qs";
import { AuthToken } from "./contract/authToken";
import { Injectable } from "@nestjs/common";
import { ADUserEntity } from "./entity/adUser.entity";
import { UserMapper } from "./user.mapper";
import { MsGraphAccessError } from "./exceptions/msGraphAccessError";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entity/user.entity";
import { Repository } from "typeorm";
import { DeviceTokenEntity } from "./entity/deviceToken.entity";

@Injectable()
export class UserService implements IUserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly msGraphConfig: MsGraphConfig,
        private readonly mapper: UserMapper,
        @InjectRepository(DeviceTokenEntity)
        private readonly deviceTokenRepository: Repository<DeviceTokenEntity>
    ) {}

    async getADUser(userId: string): Promise<AdUser> {
        try {
            const client = await this.msGraphClient();
            const user = (await client.get<ADUserEntity>(`/users/${userId}`)).data;
            return this.mapper.mapFromAdUserEntityToUserProfile(user);
        } catch (err) {
            throw new MsGraphAccessError(err.message); //TODO: implement error logging
        }
    }

    // since we do not manage users we store each logged user in our db to store user info
    async addUser(userId: string, deviceToken: string): Promise<void> {
        const [user, sameToken, existingTokens] = await Promise.all([
            this.getADUser(userId),
            this.deviceTokenRepository.findOne({ where: { deviceToken } }),
            this.deviceTokenRepository.find({ where: { user: userId } })
        ]).catch((err) => {
            throw new MsGraphAccessError(err.message);
        });

        if (sameToken) {
            return null;
        }

        const userEntity = this.mapper.mapADUserToUserEntity(user);
        userEntity.deviceTokens.push(...existingTokens);

        if (deviceToken) {
            const deviceTokenEntity = this.deviceTokenRepository.create({ deviceToken });
            userEntity.deviceTokens.push(deviceTokenEntity);
            const savedUser = await this.userRepository.save(userEntity);
            deviceTokenEntity.user = savedUser;
            await this.deviceTokenRepository.save(deviceTokenEntity);
        } else {
            await this.userRepository.save(userEntity);
        }
    }

    async getUsersByIds(userIds: string[]): Promise<UserEntity[]> {
        const users = await this.userRepository.find({ relations: ["deviceTokens"] });
        return users.filter((user) => userIds.some((userId) => userId === user.id));
    }

    async getUserById(userId: string): Promise<UserEntity> {
        const entity = await this.userRepository.findOne(userId, { relations: ["deviceTokens"] });
        return entity ? entity : null;
    }

    async msGraphClient(): Promise<AxiosInstance> {
        const authResponse = await Axios.post<AuthToken>(
            `${this.msGraphConfig.authTokenUrl}/${this.msGraphConfig.tenantId}/oauth2/v2.0/token`,
            qs.stringify({
                grant_type: "client_credentials",
                client_id: this.msGraphConfig.clientId,
                scope: this.msGraphConfig.scope,
                client_secret: this.msGraphConfig.clientSecret
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        return Axios.create({
            baseURL: this.msGraphConfig.graphUrl,
            headers: {
                authorization: `Bearer ${authResponse["data"]["access_token"]}`
            }
        });
    }
}
