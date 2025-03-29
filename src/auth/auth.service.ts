import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
    UnauthorizedException
}                       from '@nestjs/common';
import { JwtService }   from '@nestjs/jwt';

import { PrismaClient } from '@prisma/client';
import * as bcrypt      from 'bcryptjs';

import { SignUpDto }            from '@auth/dto/signup.dto';
import { AuthResponse }         from '@auth/types/auth-response.type';
import { SocialSigninProvider } from '@auth/enums/social-signin.enum';
import { PasswordDto }          from '@auth/dto/password.dto';
import { SocialSigninDto }      from '@auth/dto/social-signin.dto';
import { SocialService }        from '@auth/services/Social.services';
import { ENVS }                 from '@config/envs';
import { PrismaException }      from '@config/prisma-catch';
import { User }                 from '@user/entities/user.entity';


@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

    constructor(
        private readonly jwtService : JwtService,
        private readonly social     : SocialService
    ) {
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


    async signUp({ role, apiUserId, email, password }: SignUpDto | PasswordDto ): Promise<AuthResponse> {
        let roleId  : string    | null = null;
        let user    : User      | null = null;

        if ( apiUserId ) user = await this.user.findUnique({ where: { id: apiUserId }}) as User;

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

            if ( password ) {
                await this.pwdAdmin.create({
                    data: {
                        password: bcrypt.hashSync( password, 10 ),
                        userId  : newUser.id
                    }
                });
            }

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

        const user = await this.user.findUnique({ where: { email }});

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
        { provider, accessToken, role, apiUserId }: SocialSigninDto
    ): Promise<AuthResponse> {
        try {
            const userInfo = {
                [SocialSigninProvider.GOOGLE]    : await this.social.verifyGoogleToken( accessToken ),
                [SocialSigninProvider.FACEBOOK]  : await this.social.verifyFacebookToken( accessToken ),
                [SocialSigninProvider.GITHUB]    : await this.social.verifyGitHubToken( accessToken ),
                [SocialSigninProvider.X]         : await this.social.verifyXToken( accessToken ),
                [SocialSigninProvider.TWITCH]    : await this.social.verifyTwitchToken( accessToken )
            }[provider];

            const user = await this.user.findUnique({ where: { email: userInfo.email }});

            if ( !user ) return await this.signUp({ role, apiUserId, email: userInfo.email });

            const { apiUserId: api, ...rest } = user;

            return {
                token   : this.#getJwtToken( user.id ),
                user    : rest
            } as AuthResponse;
        } catch ( error ) {
            throw new UnauthorizedException( 'Invalid access token' );
        }
    }

}
