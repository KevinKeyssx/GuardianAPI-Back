import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    OnModuleInit,
    UnauthorizedException
}                       from '@nestjs/common';
import { JwtService }   from '@nestjs/jwt';

import { PrismaClient } from '@prisma/client';
import * as bcrypt      from 'bcryptjs';

import { SignUpDto }    from '@auth/dto/singup.dto';
import { AuthResponse } from '@auth/types/auth-response.type';
import { User }         from '@user/entities/user.entity';


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

    #handleErrors( error:any ): never {
        if (  error.code === 'P2002' ) {
            this.#logger.error( `${ error.meta.target } already exists.` );
            throw new BadRequestException( `${ error.meta.target } already exists.` );
        }

        if (  error.code === 'P2003' ) {
            const id = (error.message as string).split(':')[2].split('_')[0].replace(' `','');
            this.#logger.error( `${ id } not found.` );
            throw new BadRequestException( `${ id } not found.` );
        }

        this.#logger.error( 'Error unknown #P0000x' );
        throw new InternalServerErrorException( 'Error unknown #P0000x' );
    }


    async signUp( signUpDto: SignUpDto ): Promise<AuthResponse> {
        let roleId: string | null = null;
        const { password, role, ...user } = signUpDto;

        if ( role ) {
            const existRole = await this.role.findUnique({
                where: {
                    name    : role,
                    userId  : null
                }
            });

            if ( !existRole ) throw new BadRequestException( `Role ${role} not found.` );

            roleId = existRole.id;
        }

        try {
            const newUser = await this.user.create({
                data: {
                    ...user,
                    ...( role && roleId ) && {
                        userRoles: {
                            create: {
                                roleId
                            },
                        },
                    }
                },
                // include: {
                //     userRoles: {
                //         include: {
                //             role: true,
                //         },
                //     },
                // },
            });

            await this.pwdAdmin.create({
                data: {
                    password: bcrypt.hashSync( password, 10 ),
                    userId  : newUser.id
                }
            });

            return {
                token   : this.#getJwtToken( newUser.id ),
                user    : newUser
            } as AuthResponse;
        } catch ( error ) {
            this.#handleErrors( error );
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

        return {
            token: this.#getJwtToken( user.id ),
            user: user
        } as AuthResponse;
    }


    async validate( userId: string ) : Promise<User> {
        const user = await this.user.findUnique( {
            where: { id: userId },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        if ( !user ) throw new UnauthorizedException( 'Invalid credentials.' );

        const transformUser = {
            ...user,
            roles: user.userRoles.map( userRole => userRole.role ),
            userRoles: undefined
        }

        return transformUser as User;
    }

}
