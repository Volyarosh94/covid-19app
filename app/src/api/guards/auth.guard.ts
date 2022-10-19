import { Injectable } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { BearerStrategy } from "passport-azure-ad";

@Injectable()
export class AzureADStrategy extends PassportStrategy(BearerStrategy, "oauth-bearer") {
    constructor() {
        super({
            identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/.well-known/openid-configuration`,
            clientID: process.env.AZURE_CLIENT_ID,
            passReqToCallback: false,
            audience: "https://graph.windows.net",
            isB2C: false,
            validateIssuer: false,
            // issuer: `https://sts.windows.net/${process.env.AZURE_TENANT_ID}`,
            scope: ["User.Read"],
            loggingNoPII: false
        });
    }

    async validate(data: unknown) {
        return Promise.resolve(data);
    }
}

export const AzureADGuard = AuthGuard("oauth-bearer");
