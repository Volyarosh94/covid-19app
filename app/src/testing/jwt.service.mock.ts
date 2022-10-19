export const mockJWTService = (): any => ({
    sign: jest.fn(),
    decode: jest.fn()
});
