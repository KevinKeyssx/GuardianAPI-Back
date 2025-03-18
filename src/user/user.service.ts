import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

import { CreateUserInput }  from '@user/dto/create-user.input';
import { UpdateUserInput }  from '@user/dto/update-user.input';
import { User }             from '@user/entities/user.entity';


@Injectable()
export class UserService extends PrismaClient implements OnModuleInit {

	#logger = new Logger( UserService.name );

    onModuleInit() {
		this.$connect();
		this.#logger.log( '***Connected to DB***' );
	}


    #where = () => ({
        isDeleted   : false,
        isActive    : true,
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


    async findAll( currentUser: User ): Promise<User[]> {
        return await this.user.findMany({
            where: {
                ...this.#where(),
                apiUserId: currentUser.id
            }
        }) as User[];
    }


    async findOne( currentUser: User, id: string ): Promise<User> {
        if ( currentUser.id !== id && currentUser.apiUserId ) {
            throw new ForbiddenException( 'You are not allowed to access this user.' );
        }

        const user = await this.user.findUnique({
            where: {
                id,
                ...this.#where()
            },
            include: {
                attributes: true
            }
        });

        if ( user?.apiUserId !== currentUser.id && !currentUser.apiUserId ) {
            throw new ForbiddenException( 'You are not allowed to access this user.' );
        }

        if ( !user ) throw new NotFoundException( `User whit id ${id} not found.` );

        return user as User;
    }


    async update( currentUser: User, updateUserInput: UpdateUserInput ) {
        await this.findOne( currentUser, updateUserInput.id );
        await this.#valid( updateUserInput );

        return this.user.update({
            where: {
                id: updateUserInput.id
            },
            data: updateUserInput
        });
    }


    async remove( currentUser: User, id: string ): Promise<User> {
        await this.findOne( currentUser, id );

        return await this.user.update({
            where   : { id },
            data    : { isDeleted: true }
        }) as User;
    }

}
