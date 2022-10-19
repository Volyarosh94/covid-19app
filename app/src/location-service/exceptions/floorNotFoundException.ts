export class FloorNotFoundException extends Error {
    constructor(public readonly floorId: string) {
        super(`Floor ${floorId} not found`);
    }
}
