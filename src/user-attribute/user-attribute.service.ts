import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import {
    PrismaClient,
    UserAttribute
}                               from '@prisma/client';

import { PrismaException }          from '@config/prisma-catch';
import { AttributesArgs }           from '@common/dto/args/attributes.args';
import { CreateUserAttributeInput } from '@user-attribute/dto/create-user-attribute.input';
import { UpdateUserAttributeInput } from '@user-attribute/dto/update-user-attribute.input';
import { User }                     from '@user/entities/user.entity';


@Injectable()
export class UserAttributeService implements OnModuleInit {

    constructor(
        @Inject( 'PRISMA_CLIENT' ) private readonly prisma: PrismaClient
    ) {}


    onModuleInit() {
		this.prisma.$connect();
	}


    async #validPermissions( userId: string, currentUser: User ): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where   : { id: userId },
            include : { plan: true }
        });

        if ( !user ) throw new NotFoundException( `User whit id ${userId} not found.` );
        if ( user.apiUserId !== currentUser.id && user.id !== currentUser.id )
            throw new ForbiddenException( 'You do not have permission to this attribute' );

        return user as User;
    }


    async create(
        currentUser             : User,
        createUserAttributeInput: CreateUserAttributeInput
    ): Promise<UserAttribute> {
        const userCount = await this.prisma.user.count({ where: { apiUserId: currentUser.id }});

        if ( userCount >= currentUser.plan!.maxAttributes )
            throw new BadRequestException( 'Maximum attributes reached.' );

        try {
            return await this.prisma.userAttribute.create({
                data: {
                    ...createUserAttributeInput,
                    userId: currentUser.id,
                }
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Attribute' );
        }
    }


    async findByKeys(
        userId      : string,
        { keys }    : AttributesArgs,
        currentUser?: User | null,
    ): Promise<UserAttribute[]> {
        if ( currentUser ) await this.#validPermissions( userId, currentUser );

        return await this.prisma.userAttribute.findMany({
            where: {
                userId,
                isActive    : true,
                ...(keys && { key: { in: keys }}),
            }
        });
    }


    async findOne( currentUser: User, id: string ): Promise<UserAttribute> {
        const userAttribute = await this.prisma.userAttribute.findUnique({
            where: {
                id,
                isActive: true
            },
            include: { user: true }
        });

        if ( !userAttribute ) {
            throw new NotFoundException( `User attribute whit id ${id} not found.` );
        }

        if ( userAttribute.user.apiUserId !== currentUser.id ) {
            throw new ForbiddenException( 'You do not have permission to this attribute' );
        }

        return userAttribute;
    }


    async update(
        currentUser: User,
        updateUserAttributeInput: UpdateUserAttributeInput
    ): Promise<UserAttribute> {
        const userAttribute = await this.findOne( currentUser, updateUserAttributeInput.id );

        return await this.prisma.userAttribute.update({
            where: {
                id: updateUserAttributeInput.id,
                version: userAttribute.version
            },
            data: {
                ...updateUserAttributeInput,
                version: userAttribute.version + 1
            }
        });
    }


    async remove( currentUser: User, id: string ): Promise<UserAttribute> {
        await this.findOne( currentUser, id );

        try {
            return await this.prisma.userAttribute.delete({ where: { id }});
        } catch ( error ) {
            throw PrismaException.catch( error, 'Attribute' );
        }
    }

}
