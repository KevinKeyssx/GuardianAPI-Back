
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

import { PaginationArgs }   from '@common/dto/args/pagination.args';
import { SearchArgs }       from '@common/dto/args/search.args';
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


    #guardianIncludes = () => ({
        userRoles   : {
            include: {
                role: true,
                user: true
            }
        },
        pwdAdmins   : { where: { isActive: true }},
        secrets     : { take: 1 }
        // attributes  : true,
        // roles       : true,
        // apiUser     : true,
        // users       : true,
    });

    #apiUserIncludes = () => ({
        attributes  : true,
        userRoles   : true,
        pwdAdmins   : true,
    });


    async #valid( userInput: UpdateUserInput ) {
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


    async findAll(
        currentUser: User,
        { page, each, field, orderBy }: PaginationArgs,
        {search}: SearchArgs
    ): Promise<User[]> {
        return await this.user.findMany({
            take    : each,
            skip    : page,
            orderBy : { [field]: orderBy },
            include : this.#guardianIncludes(),
            where   : {
                ...this.#where(),
                apiUserId: currentUser.id,
                [field]: {
                    contains    : search,
                    mode        : 'insensitive',
                }
            },
        }) as unknown as User[];
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
            include: this.#guardianIncludes()
        });

        if ( !user ) throw new NotFoundException( `User whit id ${id} not found.` );
        if ( user.apiUserId !== currentUser.id && !currentUser.apiUserId && id !== currentUser.id ) {
            throw new ForbiddenException( 'You are not allowed to access this user.' );
        }

        return user as unknown as User;
    }


    async update(
        currentUser: User,
        updateUserInput: UpdateUserInput
    ): Promise<User> {
        await this.findOne( currentUser, updateUserInput.id );
        await this.#valid( updateUserInput );

        return this.user.update({
            where   : { id: updateUserInput.id },
            data    : updateUserInput,
            include : this.#guardianIncludes()
        }) as unknown as User;
    }


    async remove( currentUser: User, id: string ): Promise<User> {
        await this.findOne( currentUser, id );

        return await this.user.update({
            where   : { id },
            data    : { isDeleted: true }
        }) as User;
    }

}
