import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';

import { PrismaClient, User } from '@prisma/client';

import { CreateUserInput } from '@user/dto/create-user.input';
import { UpdateUserInput } from '@user/dto/update-user.input';


@Injectable()
export class UserService extends PrismaClient implements OnModuleInit {

	#logger = new Logger( UserService.name );

    onModuleInit() {
		this.$connect();
		this.#logger.log( '***Connected to DB***' );
	}


    #where = () => ({
        isDeleted   : false,
        isActive    : true
    });


    async #valid( userInput: CreateUserInput | UpdateUserInput ) {
        if ( userInput.email ) {
            const email = await this.user.findUnique({
                where: {
                    email: userInput.email
                }
            });

            if ( email !== null ) {
                throw new BadRequestException( 'Email already exists.' );
            }
        }

        if ( userInput.nickname ) {
            const nickname = await this.user.findUnique({
                where: {
                    nickname: userInput.nickname
                }
            });

            if ( nickname !== null ) {
                throw new BadRequestException( 'Nickname already exists.' );
            }
        }
    }


    async create( createUserInput: CreateUserInput ): Promise<User> {
        await this.#valid( createUserInput );

        const { password, ...user } = createUserInput;
        const newUser = await this.user.create({
            data: user
        });

        await this.pwdAdmin.create({
            data: {
                password,
                userId: newUser.id
            }
        });

        return newUser;
    }


    async findAll(): Promise<User[]> {
        return await this.user.findMany({
            where: this.#where()
        });
    }


    async findOne( id: string ): Promise<User> {
        const user = await this.user.findUnique({
            where: {
                id,
                ...this.#where()
            }
        });

        if ( !user ) throw new NotFoundException( `User whit id ${id} not found.` );

        return user;
    }


    async update( updateUserInput: UpdateUserInput ) {
        const user = await this.findOne( updateUserInput.id );

        if ( user.isDeleted ) throw new NotFoundException( `User whit id ${updateUserInput.id} not found.` );
        if ( !user.isActive ) throw new NotFoundException( `User whit id ${updateUserInput.id} is not active.` );

        const { password, ...restUser } = updateUserInput;

        if ( password ) throw new BadRequestException( 'Password cannot be updated.' );

        await this.#valid( updateUserInput );

        return this.user.update({
            where: {
                id: updateUserInput.id
            },
            data: restUser
        });
    }


    async remove( id: string ): Promise<User> {
        await this.findOne( id );

        return this.user.update({
            where   : { id },
            data    : { isDeleted: true }
        })
    }

}
