export class LocationNotFoundException extends Error {
    constructor(public readonly locationId: string) {
        super(`Location ${locationId} is not found`);
    }
}
