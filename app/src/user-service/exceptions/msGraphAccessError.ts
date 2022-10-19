export class MsGraphAccessError extends Error {
    constructor(readonly message: string) {
        super(message);
    }
}
