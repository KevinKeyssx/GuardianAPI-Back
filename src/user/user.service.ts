import {
    ForbiddenException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

import { PaginationArgs }   from '@common/dto/args/pagination.args';
import { SearchArgs }       from '@common/dto/args/search.args';
import { PrismaException }  from '@config/prisma-catch';
import { UpdateUserInput }  from '@user/dto/update-user.input';
import { UserResponse }     from '@user/entities/user-response.';
import { User }             from '@user/entities/user.entity';


@Injectable()
export class UserService implements OnModuleInit {

    constructor(
        @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient
    ) {}

	#logger = new Logger( UserService.name );

    onModuleInit() {
		this.prisma.$connect();
		this.#logger.log( '***Connected to DB***' );
	}


    #guardianIncludes = () => ({
        userRoles   : {
            include: {
                role: true,
                user: true
            }
        },
        pwdAdmins   : { where: { isActive: true }},
        secrets     : { take: 1 }
    });


    #getUserResponse = ( user: User ): UserResponse => ({
        ...user,
        secret      : user.secrets?.[0] || null,
        pwdAdmin    : user.pwdAdmins?.[0] || null,
    }) as UserResponse;


    async findAll(
        currentUser: User,
        { page, each, field, orderBy }: PaginationArgs,
        { search }: SearchArgs
    ): Promise<UserResponse[]> {
        const users = await this.prisma.user.findMany({
            take    : each,
            skip    : page,
            // orderBy : { [field]: orderBy },
            orderBy : { createdAt: orderBy },
            include : this.#guardianIncludes(),
            where   : {
                isActive    : true,
                apiUserId   : currentUser.id,
                // [field]: {
                //     contains    : search,
                //     mode        : 'insensitive',
                // }
            },
        }) as unknown as User[];

        return users.map( user => this.#getUserResponse( user ));
    }


    async totalUsers(
        currentUser: User
    ): Promise<number> {
        const totalUsers = await this.prisma.user.count({
            where: {
                apiUserId: currentUser.id,
                isActive: true
            }
        });
        console.log('🚀 ~ file: user.service.ts:80 ~ users:', totalUsers)

        return totalUsers
        // return users.map( user => this.#getUserResponse( user ));
    }


    async findOne( currentUser: User, id: string ): Promise<UserResponse> {
        if ( currentUser.id !== id && currentUser.apiUserId ) {
            throw new ForbiddenException( 'You are not allowed to access this user.' );
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id,
                isActive: true,
            },
            include: this.#guardianIncludes()
        }) as unknown as User;

        if ( !user ) throw new NotFoundException( `User whit id ${id} not found.` );
        if ( user.apiUserId !== currentUser.id && !currentUser.apiUserId && id !== currentUser.id ) {
            throw new ForbiddenException( 'You are not allowed to access this user.' );
        }

        return this.#getUserResponse( user );
    }


    async update(
        currentUser: User,
        updateUserInput: UpdateUserInput
    ): Promise<UserResponse> {
        const existingUser = await this.findOne( currentUser, updateUserInput.id );

        try {
            const user = await this.prisma.user.update({
                where   : { id: updateUserInput.id, version: existingUser.version },
                data    : {
                    ...updateUserInput,
                    version: existingUser.version + 1,
                },
                include: this.#guardianIncludes()
            }) as User;

            return this.#getUserResponse( user );
        } catch ( error ) {
            throw PrismaException.catch( error, 'User' );
        }
    }


    async remove( currentUser: User, id: string ):  Promise<boolean> {
        await this.findOne( currentUser, id );

        try {
            return await this.prisma.user.delete({ where: { id }}) !== null;
        } catch ( error ) {
            throw PrismaException.catch( error, 'User' );
        }
    }

}
