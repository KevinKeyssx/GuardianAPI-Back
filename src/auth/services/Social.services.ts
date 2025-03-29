import { InternalServerErrorException, UnauthorizedException } from "@nestjs/common";

import { SocialSigninProvider } from "@auth/enums/social-signin.enum";
import { ENVS }                 from "@config/envs";


export class SocialService {

    constructor() {}


    async verifyGoogleToken( accessToken: string ) {
        return await this.#verifyToken(
            accessToken,
            `${ENVS.SOCIAL_GOOGLE_AUTH}${accessToken}`,
            SocialSigninProvider.GOOGLE
        );
    }


    async verifyFacebookToken( accessToken: string ) {
        return await this.#verifyToken(
            accessToken,
            `${ENVS.SOCIAL_FACEBOOK_AUTH}${accessToken}`,
            SocialSigninProvider.FACEBOOK
        );
    }


    async verifyGitHubToken( accessToken: string ) {
        return await this.#verifyToken(
            accessToken,
            ENVS.SOCIAL_GITHUB_AUTH,
            SocialSigninProvider.GITHUB
        );
    }


    async verifyXToken( accessToken: string ) {
        return await this.#verifyToken(
            accessToken,
            ENVS.SOCIAL_X_AUTH,
            SocialSigninProvider.X
        );
    }


    async verifyTwitchToken( accessToken: string ) {
        return await this.#verifyToken(
            accessToken,
            ENVS.SOCIAL_TWITCH_AUTH,
            SocialSigninProvider.TWITCH
        );
    }


    async #verifyToken(
        accessToken : string,
        url         : string,
        provider    : SocialSigninProvider
    ): Promise<{ email: string }> {
        try {
            const response = await fetch( url, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if ( !response.ok ) {
                throw new UnauthorizedException( 'Invalid token' );
            }

            const data = await response.json();

            if ( !data.email ) {
                throw new UnauthorizedException( `Invalid token response from ${provider}` );
            }

            return { email: data.email };
        } catch ( error ) {
            if ( error instanceof UnauthorizedException ) {
                throw error;
            }

            throw new InternalServerErrorException( `Error verifying ${provider} token` );
        }
    }

}