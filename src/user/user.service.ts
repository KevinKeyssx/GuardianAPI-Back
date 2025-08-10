import {
    ForbiddenException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import { Prisma, PrismaClient } from '@prisma/client';
import { FileUpload }           from 'graphql-upload-minimal';

import { PaginationArgs }       from '@common/dto/args/pagination.args';
import { SearchArgs }           from '@common/dto/args/search.args';
import { FileManagerService }   from '@common/services/filemanager/upload-file.service';
import { PrismaException }      from '@config/prisma-catch';
import { UpdateUserInput }      from '@user/dto/update-user.input';
import { UserResponse }         from '@user/entities/user-response.';
import { User }                 from '@user/entities/user.entity';
import { CreateUserInput }      from '@user/dto/create-user.input';


@Injectable()
export class UserService implements OnModuleInit {

	#logger = new Logger( UserService.name );

    constructor(
        @Inject( 'PRISMA_CLIENT' ) private readonly prisma: PrismaClient,
        private readonly fileManagerService: FileManagerService,
    ) {}


    onModuleInit() {
		this.prisma.$connect();
		this.#logger.log( '***Connected to DB***' );
	}


    async create(
        createUserInput : CreateUserInput,
        currentUser     : User,
        file?           : FileUpload
    ) {
        let avatar = file
            ? ( await this.fileManagerService.save( file )).secure_url.split( '/' ).pop()
            : undefined;

        try {
            const user = await this.prisma.user.create({
                data: {
                    ...createUserInput,
                    apiUserId: currentUser.id,
                    avatar
                }
            });

            const userAttributes = await this.prisma.userAttribute.findMany({
                where: {
                    userId: user.apiUserId || user.id,
                    isActive: true,
                    defaultValue: {
                        not: Prisma.DbNull
                    }
                },
                select: {
                    id: true,
                    defaultValue: true,
                }
            });

            if ( userAttributes.length > 0 ) {
                await this.prisma.userAttributeValue.createMany({
                    data: userAttributes.map( attribute => ({
                        userId          : user.id,
                        userAttributeId : attribute.id,
                        value           : attribute.defaultValue as Prisma.InputJsonValue
                    }))
                });
            }

            return user;
        } catch ( error ) {
            throw PrismaException.catch( error, 'User' );
        }
    }


    #guardianIncludes = () => ({
        userRoles: {
            include: {
                role: true,
                user: true
            }
        },
        pwdAdmins   : { where: { isActive: true }},
        secrets     : { take: 5 }
    });


    #getUserResponse = ( user: User ): UserResponse => ({
        ...user,
        secret      : user.secrets?.[0]     || null,
        pwdAdmin    : user.pwdAdmins?.[0]   || null,
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
                // isActive    : true,
                apiUserId   : currentUser.id,
                // [field]: {
                //     contains    : search,
                //     mode        : 'insensitive',
                // }
            },
        }) as unknown as User[];

        return users.map( user => this.#getUserResponse( user ));
    }


    async findOne( currentUser: User, id: string ): Promise<UserResponse> {
        if ( currentUser.id !== id && currentUser.apiUserId ) {
            throw new ForbiddenException( 'You are not allowed to access this user.' );
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id,
                // isActive: true,
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
        currentUser     : User,
        updateUserInput : UpdateUserInput,
        file?           : FileUpload
    ): Promise<UserResponse> {
        let avatar : string | undefined = undefined;

        const existingUser = await this.findOne( currentUser, updateUserInput.id );

        try {
            if ( file ) {
                if ( existingUser.avatar ) {
                    await this.fileManagerService.delete( existingUser.avatar );
                }

                avatar = ( await this.fileManagerService.save( file )).secure_url.split( '/' ).pop();
            }

            const user = await this.prisma.user.update({
                where   : { id: updateUserInput.id, version: existingUser.version },
                data    : {
                    ...updateUserInput,
                    avatar,
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
        const user = await this.findOne( currentUser, id );

        if ( user.avatar ) {
            await this.fileManagerService.delete( user.avatar );
        }

        try {
            return await this.prisma.user.delete({ where: { id }}) !== null;
        } catch ( error ) {
            throw PrismaException.catch( error, 'User' );
        }
    }

}
