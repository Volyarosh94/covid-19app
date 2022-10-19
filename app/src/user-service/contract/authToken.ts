export interface AuthToken {
    token_type: string;
    scope: string;
    expires_in: number;
    ext_expires_in: string;
    access_token: string;
}
