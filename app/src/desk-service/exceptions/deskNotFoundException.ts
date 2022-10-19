export class DeskNotFoundException extends Error {
    constructor(public readonly deskId: string) {
        super(`Desk ${deskId} is not found`);
    }
}
