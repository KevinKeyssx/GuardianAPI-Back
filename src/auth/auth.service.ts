import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    OnModuleInit,
    UnauthorizedException
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { SignUpDto } from './dto/singup.dto';
import { AuthResponse } from './types/auth-response.type';


@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

    #logger = new Logger( AuthService.name );

    onModuleInit() {
		this.$connect();
        this.#logger.log( '***Connected to DB AUTH***' );
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
                    userId: newUser.id
                }
            });

            return {
                token: 'ewrdsfsd123wdsfwerds1123ssw2#¡$[s',
                user: newUser
            } as AuthResponse;
        } catch (error) {
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
            token: 'asdfer123wwss+¡##¡122qwedd',
            user: user
        } as AuthResponse;
    }

}
