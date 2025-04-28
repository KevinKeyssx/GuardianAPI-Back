import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

import { validateGitHubToken, ValidationError } from 'validate-github-token';

import { GitHubModel, GitHubUser }  from './github.model';
import { ENVS }                     from '@config/envs';
import { SocialSignupModel }        from '@auth/services/models/social-signup.model';


@Injectable()
export class GitHubAuthService {
    // TODO: AGREGAR REDIS

    static async verifyResponse<T>( response: Response ): Promise<T> {
        if ( response.status === 429 ) {
            const retryAfter = response.headers.get( 'Retry-After' ) || '60';
            throw new InternalServerErrorException(
                `GitHub API rate limit exceeded. Retry after ${retryAfter} seconds`,
            );
        }

        if ( !response.ok ) {
            throw new UnauthorizedException( 'Invalid GitHub token' );
        }

        return await response.json();
    }


    static async getEmail( accessToken: string ) {
        const emailResponse = await fetch( ENVS.SOCIAL_GITHUB_AUTH + '/emails', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'User-Agent': 'GuardianAPI',
            },
        });

        const emails = await this.verifyResponse<GitHubModel[]>( emailResponse );
        console.log('🚀 ~ file: github-auth.service.ts:58 ~ emails:', emails)

        const email = emails.find( email => email.primary && email.verified )?.email;

        if ( !email ) {
            throw new UnauthorizedException( 'No verified primary email found' );
        }

        return email;
    }

    static async verifyGitHubToken( accessToken: string ): Promise<SocialSignupModel> {
        // const cached = this.cache.get<{ email: string }>(accessToken);

        // if (cached) {
        //     const token = this.jwtService.sign({ email: cached.email, provider: 'GitHub' });
        //     return { token, email: cached.email };
        // }

        try {
            await validateGitHubToken( accessToken, { scope: { included: ['user:email'] }});

            const response = await fetch( ENVS.SOCIAL_GITHUB_AUTH, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'User-Agent': 'GuardianAPI',
                },
            });

            const data = await this.verifyResponse<GitHubUser>( response );

            let email: string | undefined | null = data.email;

            if ( !email ) email = await this.getEmail( accessToken );

            // this.cache.set(accessToken, { email });
            // const token = this.jwtService.sign({ email, provider: 'GitHub' });

            return { email, nickname: data.login, avatar: data.avatar_url } as SocialSignupModel;
        } catch ( error ) {
            if ( error instanceof ValidationError ) {
                throw new UnauthorizedException( `GitHub token validation failed: ${error.message}` );
            }

            if ( error instanceof UnauthorizedException ) {
                throw error;
            }

            throw new InternalServerErrorException( 'Error verifying GitHub token' );
        }
    }
}