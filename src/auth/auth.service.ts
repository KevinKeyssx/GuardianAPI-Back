import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    OnModuleInit,
    UnauthorizedException
}                       from '@nestjs/common';
import { JwtService }   from '@nestjs/jwt';

import { PrismaClient } from '@prisma/client';
import * as bcrypt      from 'bcryptjs';

import { SignUpDto }        from '@auth/dto/signup.dto';
import { AuthResponse }     from '@auth/types/auth-response.type';
import { ENVS }             from '@config/envs';
import { PrismaException }  from '@config/prisma-catch';
import { User }             from '@user/entities/user.entity';
import { SocialSigninDto } from './dto/social-signin.dto';
import { SocialSigninProvider } from './enums/social-signin.enum';


@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

    constructor( private readonly jwtService: JwtService ) {
        super();
    }

    #logger = new Logger( AuthService.name );

    onModuleInit() {
		this.$connect();
        this.#logger.log( '***Connected to DB AUTH***' );
	}


    #getJwtToken( userId: string ) {
        return this.jwtService.sign({ id: userId }, { expiresIn: '4h' });
    }


    async signUp({ password, role, apiUserId, email }: SignUpDto ): Promise<AuthResponse> {
        let roleId  : string | null = null;
        let user    : User | null = null;

        if ( apiUserId ) user = await this.user.findUnique({ where: { id: apiUserId } }) as User;

        if ( role ) {
            const existRole = await this.role.findFirst({
                where: {
                    name    : role,
                    userId  : user?.id
                }
            });

            if ( !existRole ) throw new NotFoundException( `Role ${role} not found.` );
            if ( existRole.name === ENVS.ROLE_SECRET && apiUserId ) {
                throw new BadRequestException( 'Not allowed to create user.' );
            }

            roleId = existRole.id;
        }

        try {
            const newUser = await this.user.create({
                data: {
                    email,
                    apiUserId,
                    ...( role && roleId ) && { userRoles: { create: { roleId }}},
                }
            });

            await this.pwdAdmin.create({
                data: {
                    password: bcrypt.hashSync( password, 10 ),
                    userId  : newUser.id
                }
            });

            const { apiUserId: api, ...rest } = newUser;

            return {
                token   : this.#getJwtToken( newUser.id ),
                user    : rest
            } as AuthResponse;
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }


    async signIn( signUpDto: SignUpDto ) : Promise<AuthResponse> {
        const { email, password } = signUpDto;

        const user = await this.user.findUnique( {
            where: { email }
        });

        if ( !user ) throw new UnauthorizedException( 'Invalid credentials.' );

        const pwdAdmin = await this.pwdAdmin.findFirst({
            where: {
                userId: user.id,
                isActive: true
            }
        });

        if ( !pwdAdmin ) throw new UnauthorizedException( 'Invalid credentials.' );

        if ( !bcrypt.compareSync( password, pwdAdmin.password ))
            throw new UnauthorizedException( 'Invalid credentials.' );

        const { apiUserId, ...rest } = user;

        return {
            token   : this.#getJwtToken( user.id ),
            user    : rest
        } as AuthResponse;
    }


    async validate( userId: string ) : Promise<User> {
        const user = await this.user.findUnique( {
            where: {
                id      : userId,
                isActive: true,
                pwdAdmins: { some: { isActive: true } }
            },
            include: {
                userRoles: { include: { role: true }},
                pwdAdmins: true
            },
        });

        if ( !user ) throw new UnauthorizedException( 'Unauthorized user.' );

        return {
            ...user,
            roles       : user.userRoles.map( userRole => userRole.role ),
            userRoles   : undefined,
            pwdAdmins   : undefined
        } as User;
    }


    revalidateToken = async ( user: User ) : Promise<AuthResponse> => ({
        token: this.#getJwtToken( user.id ),
        user
    }) as AuthResponse;




    async signInSocial(
        { provider, accessToken }: SocialSigninDto
    ): Promise<AuthResponse> {
        try {
            const userInfo = {
                [SocialSigninProvider.GOOGLE]    : await this.#verifyGoogleToken( accessToken ),
                [SocialSigninProvider.FACEBOOK]  : await this.#verifyFacebookToken( accessToken ),
                [SocialSigninProvider.GITHUB]    : await this.#verifyGitHubToken( accessToken ),
                [SocialSigninProvider.X]         : await this.#verifyXToken( accessToken ),
                [SocialSigninProvider.TWITCH]    : await this.#verifyTwitchToken( accessToken )
            }[provider];

            const user = await this.user.findUnique({ where: { email: userInfo.email }});

            if ( !user ) throw new UnauthorizedException( 'Invalid credentials.' );

            if ( !user ) {
                // TODO: Ingresar nuevo usuario
                // En este punto se pude crear un usuario sin contraseña
            }

            const { apiUserId, ...rest } = user;

            return {
                token   : this.#getJwtToken( user.id ),
                user    : rest
            } as AuthResponse;
        } catch ( error ) {
            throw new UnauthorizedException( 'Invalid access token' );
        }
    }

    async #verifyGoogleToken( accessToken: string ) {
        try {
            const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${accessToken}`);

            if ( !response.ok ) {
                throw new UnauthorizedException( 'Invalid Google token' );
            }

            const data = await response.json();

            if ( !data.email ) {
                throw new UnauthorizedException( 'Invalid token response from Google' );
            }

            return { email: data.email };
        } catch ( error ) {
            if ( error instanceof UnauthorizedException ) {
                throw error;
            }

            throw new InternalServerErrorException( 'Error verifying Google token' );
        }
    }

    async #verifyFacebookToken( accessToken: string ) {
        const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
        const data = await response.json();
        return { email: data.email };
    }

    async #verifyGitHubToken( accessToken: string ) {
        const response = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await response.json();
        return { email: data.email };
    }

    async #verifyXToken( accessToken: string ) {
        const response = await fetch('https://api.twitter.com/2/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await response.json();
        return { email: data.email };
    }

    async #verifyTwitchToken( accessToken: string ) {
        const response = await fetch('https://id.twitch.tv/oauth2/validate', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await response.json();
        return { email: data.email };
    }

}
