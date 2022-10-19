export const authServiceMock = () => ({
    getUserDataFromToken: jest.fn(),
    login: jest.fn(),
    getAuthToken: jest.fn()
});
