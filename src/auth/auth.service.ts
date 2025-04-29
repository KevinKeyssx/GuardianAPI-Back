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
import * as argon2      from 'argon2';
import Redis            from 'ioredis';

import { SignUpDto }            from '@auth/dto/signup.dto';
import { AuthResponse }         from '@auth/types/auth-response.type';
import { SocialSigninProvider } from '@auth/enums/social-signin.enum';
import { SocialSigninDto }      from '@auth/dto/social-signin.dto';
import { SocialService }        from '@auth/services/Social.services';
import { SignInDto }            from '@auth/dto/signin.dto';
import { GitHubAuthService }    from '@auth/services/github/github-auth.service';
import { SocialSignupModel }    from '@auth/services/models/social-signup.model';
import { ENVS }                 from '@config/envs';
import { PrismaException }      from '@config/prisma-catch';
import { User }                 from '@user/entities/user.entity';


@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

    readonly #redis: Redis;
    #logger = new Logger( AuthService.name );


    constructor(
        private readonly jwtService : JwtService,
        private readonly social     : SocialService
    ) {
        super();

        // this.#redis = new Redis({
        //     host        : ENVS.REDIS_HOST,
        //     port        : ENVS.REDIS_PORT,
        //     password    : ENVS.REDIS_PASSWORD
        // });

        // this.#redis.on('connect', () => {
        //     this.#logger.log('***Connected to REDIS***');
        // });
    
        // this.#redis.on('error', (err) => {
        //     this.#logger.error('Redis connection failed:', err);
        // });
    
        // // Log del objeto Redis (para inspección)
        // this.#logger.log('Redis instance initialized:', this.#redis);
    }


    onModuleInit() {
		this.$connect();
        this.#logger.log( '***Connected to DB AUTH***' );
	}


    #getJwtToken( userId: string ) {
        return this.jwtService.sign({ id: userId }, { expiresIn: '4h' });
    }


    async signUp(
        { role, apiUserId, email, password, nickname, avatar, name }: SignUpDto,
        isVerified: boolean = false
    ): Promise<AuthResponse> {
        let roleId  : string    | null = null;
        let user    : User      | null = null;

        try {
            if ( apiUserId ) {
                user = await this.user.findUnique({
                    where   : { id: apiUserId },
                    include : { plan: true },
                }) as User;

                if ( !user || !user.plan ) throw new NotFoundException( 'User or plan not found.' );

                const userCount = await this.user.count({ where: { apiUserId }});

                if ( userCount >= user.plan.maxUsers ) throw new BadRequestException( 'Maximum users reached.' );
            }

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

            const newUser = await this.$transaction( async ( prisma ) => {
                const userTransaction = await prisma.user.create({
                    data: {
                        email,
                        apiUserId,
                        nickname,
                        avatar,
                        name,
                        isVerified,
                        ...( role && roleId ) && { userRoles: { create: { roleId }}},
                        ...( !apiUserId && { planId: ENVS.FREE_PLAN_ID })
                    },
                    select: {
                        id          : true,
                        email       : true,
                        createdAt   : true
                    }
                });

                if ( password ) {
                    await prisma.pwdAdmin.create({
                        data: {
                            password: await argon2.hash( password ),
                            userId  : userTransaction.id
                        }
                    });
                }

                return userTransaction;
            });

            return {
                token   : this.#getJwtToken( newUser.id ),
                user    : newUser
            } as AuthResponse;
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }


    async signIn({ email, password }: SignInDto ) : Promise<AuthResponse> {
        const user = await this.user.findFirst({ where: { email }});

        if ( !user ) throw new UnauthorizedException( 'Invalid credentials.' );
        if ( !user.isVerified ) throw new UnauthorizedException( 'User not verified.' );

        // const attemptsKey = `login_attempts:${user.id}`;
        // const lockKey = `lock:${user.id}`;
        // const maxAttempts = 5;
        // const lockDuration = 15 * 60;

        // const lockedUntil = await this.redis.get(lockKey);
        // if (lockedUntil && parseInt(lockedUntil) > Date.now()) {
        //     const minutesLeft = Math.ceil((parseInt(lockedUntil) - Date.now()) / 60000);
        //     throw new UnauthorizedException(`Account locked. Try again in ${minutesLeft} minutes.`);
        // }

        const pwdAdmin = await this.pwdAdmin.findFirst({
            select: { password: true },
            where: {
                userId      : user.id,
                isActive    : true
            }
        });

        if ( !pwdAdmin ) throw new UnauthorizedException( 'Invalid credentials.' );

        const isPasswordValid = await argon2.verify( pwdAdmin.password, password );
        // TODO: Quitar esta validacin cuando tenga redis
        if ( !isPasswordValid ) throw new UnauthorizedException( 'Invalid credentials.' );

        // if (!isPasswordValid) {
        //     const attempts = parseInt(await this.redis.get(attemptsKey) || '0') + 1;
        //     await this.redis.set(attemptsKey, attempts, 'EX', lockDuration);

        //     if (attempts >= maxAttempts) {
        //         const lockTime = Date.now() + lockDuration * 1000;
        //         await this.redis.set(lockKey, lockTime, 'EX', lockDuration);
        //         throw new UnauthorizedException('Too many failed attempts. Account locked for 15 minutes.');
        //     }
        //     throw new UnauthorizedException('Invalid credentials.');
        // }

        // await this.redis.del(attemptsKey);
        // await this.redis.del(lockKey);

        const { apiUserId, version, isVerified, ...rest } = user;

        return {
            token   : this.#getJwtToken( user.id ),
            user    : rest
        } as AuthResponse;
    }


    async validate( userId: string ) : Promise<User> {
        const user = await this.user.findUnique( {
            where: {
                id          : userId,
                isActive    : true,
                pwdAdmins   : { some: { isActive: true } }
            },
            include: {
                userRoles: { include: { role: true }},
                pwdAdmins: true
            },
        });

        if ( !user ) throw new UnauthorizedException( 'Unauthorized user.' );
        if ( !user.isVerified ) throw new UnauthorizedException( 'User not verified.' );

        const {
            userRoles,
            pwdAdmins,
            ...rest
        } = user;

        // return {
        //     ...user,
        //     roles       : user.userRoles.map( userRole => userRole.role ),
        //     userRoles   : undefined,
        //     pwdAdmins   : undefined
        // } as User;
        return {
            ...rest,
            roles       : user.userRoles.map( userRole => userRole.role ),
        } as User;
    }


    // TODO: Implementar validación por token
    // TODO: Implementar un ratelimit con redis
    // TODO: Implementar un logout con redis
    revalidateToken = async ( user: User ) : Promise<AuthResponse> => ({
        token: this.#getJwtToken( user.id ),
        user
    }) as AuthResponse;


    async signInSocial(
        { provider, accessToken, role, apiUserId }: SocialSigninDto
    ): Promise<AuthResponse> {
        console.log('🚀 ~ file: auth.service.ts:231 ~ provider:', provider)
        console.log('🚀 ~ file: auth.service.ts:231 ~ accessToken:', accessToken)
        try {
            const userInfo: SocialSignupModel = {
                // [SocialSigninProvider.GOOGLE]    : await this.social.verifyGoogleToken( accessToken ),
                // [SocialSigninProvider.FACEBOOK]  : await this.social.verifyFacebookToken( accessToken ),
                [SocialSigninProvider.GITHUB]    : await GitHubAuthService.verifyGitHubToken( accessToken ),
                // [SocialSigninProvider.X]         : await this.social.verifyXToken( accessToken ),
                // [SocialSigninProvider.TWITCH]    : await this.social.verifyTwitchToken( accessToken )
            }[provider];
            // const userInfo = await this.social.verifyGitHubToken( accessToken )
            // const userInfo = await GitHubAuthService.verifyGitHubToken( accessToken )
            console.log('🚀 ~ file: auth.service.ts:235 ~ userInfo:', userInfo)

            const user = await this.user.findFirst({ where: { email: userInfo.email, apiUserId }});

            // if ( !user ) return await this.signUp({ role, apiUserId, email: userInfo.email });
            const signUp = {
                role,
                apiUserId,
                email       : userInfo.email,
                nickname    : userInfo.nickname,
                avatar      : userInfo.avatar,
            }

            if ( !user ) return await this.signUp( signUp, true );

            const { apiUserId: api, version, isVerified, ...rest } = user;

            return {
                token   : this.#getJwtToken( user.id ),
                user    : rest
            } as AuthResponse;
        } catch ( error ) {
            throw new UnauthorizedException( error.message );
        }
    }


    async logout(token: string): Promise<void> {
        try {
            const payload = this.jwtService.decode(token) as { exp: number; id: string } | null;

            if (!payload || !payload.exp) {
                return; // Token inválido o sin expiración, no hacemos nada
            }

            // const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
            // if (expiresIn > 0) {
            //     await this.redis.set(`revoked:${token}`, 'true', 'EX', expiresIn);
            // }
        } catch (error) {
            console.warn(`Failed to revoke token: ${error.message}`);
        }
    }

}
