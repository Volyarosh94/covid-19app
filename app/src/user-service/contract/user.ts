export interface User {
    id: string;
    email: string;
    name: string;
    mobilePhone: string;
    deviceTokens: string[];
    location?: string;
}
