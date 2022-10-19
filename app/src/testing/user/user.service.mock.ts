import { IUserService } from "../../user-service/IUserService";

export const mockUserService = (): IUserService => ({
    getADUser: jest.fn(),
    msGraphClient: jest.fn(),
    addUser: jest.fn(),
    getUsersByIds: jest.fn(),
    getUserById: jest.fn()
});
