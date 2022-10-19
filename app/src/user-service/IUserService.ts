import { AxiosInstance } from "axios";
import { AdUser } from "./contract/adUser";
import { UserEntity } from "./entity/user.entity";

export interface IUserService {
    getADUser(userId: string): Promise<AdUser>;
    addUser(userId: string, deviceToken: string): Promise<void>;
    msGraphClient(): Promise<AxiosInstance>;
    getUsersByIds(userIds: string[]): Promise<UserEntity[]>;
    getUserById(userId: string): Promise<UserEntity>;
}
