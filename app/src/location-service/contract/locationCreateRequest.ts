
export interface LocationCreateRequest {
    locationName: string;
    locationAddress: string;
    country?: string;
    city?: string;
    region: string;
    timezone: string;
}
