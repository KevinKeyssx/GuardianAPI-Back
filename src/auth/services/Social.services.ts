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
            console.log('🚀 ~ file: Social.services.ts:65 ~ response:', response)

            if ( !response.ok ) {
                throw new UnauthorizedException( 'Invalid token' );
            }

            const scopes = response.headers.get('X-OAuth-Scopes')?.split(', ') || [];
            if (!scopes.includes('user:email')) {
                throw new UnauthorizedException('GitHub token lacks user:email scope');
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