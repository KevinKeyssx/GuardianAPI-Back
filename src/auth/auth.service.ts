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

import { SignUpDto }        from '@auth/dto/singup.dto';
import { AuthResponse }     from '@auth/types/auth-response.type';
import { ENVS }             from '@config/envs';
import { PrismaException }  from '@config/prisma-catch';
import { User }             from '@user/entities/user.entity';


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
        return this.jwtService.sign({ id: userId });
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
                isActive: true
            },
            include: { userRoles: { include: { role: true }}}
        });

        if ( !user ) throw new UnauthorizedException( 'Invalid credentials.' );

        return {
            ...user,
            roles       : user.userRoles.map( userRole => userRole.role ),
            userRoles   : undefined
        } as User;
    }


    revalidateToken = async ( user: User ) : Promise<AuthResponse> => ({
        token: this.#getJwtToken( user.id ),
        user
    }) as AuthResponse;

}
