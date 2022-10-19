export class UserNotFountException extends Error {
    constructor(public readonly userId: string) {
        super(`User ${userId} not found`);
    }
}
