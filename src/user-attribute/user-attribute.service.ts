import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import { PrismaClient, UserAttribute } from '@prisma/client';

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
        const userCount = await this.prisma.userAttribute.count({ where: { userId: currentUser.id }});

        if ( userCount >= currentUser.plan!.maxAttributes ) {
            throw new BadRequestException( 'Maximum attributes reached.' );
        }

        try {
            const attribute = await this.prisma.userAttribute.create({
                data: {
                    ...createUserAttributeInput,
                    userId: currentUser.id,
                }
            });

            if ( createUserAttributeInput.defaultValue ) {
                const subordinateUsers = await this.prisma.user.findMany({
                    where   : { apiUserId: currentUser.id },
                    select  : { id: true }
                });

                if ( subordinateUsers.length > 0 ) {
                    const valuesToCreate = subordinateUsers.map( user => ({
                        userId          : user.id,
                        userAttributeId : attribute.id,
                        value           : createUserAttributeInput.defaultValue,
                    }));

                    valuesToCreate.push({
                        userId          : currentUser.id,
                        userAttributeId : attribute.id,
                        value           : createUserAttributeInput.defaultValue,
                    });

                    await this.prisma.userAttributeValue.createMany({
                        data: valuesToCreate,
                        skipDuplicates: true,
                    });
                }
            }

            return attribute;
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

        const attributes = await this.prisma.userAttribute.findMany({
            include: { values: {
                where : { userId }
            }},
            where: {
                // userId,
                // isActive    : true,
                ...(keys && { key: { in: keys }}),
            }
        });

        return attributes.map( attribute => ({
            ...attribute,
            value   : attribute.values?.[0]?.value  ?? null,
            valueId : attribute.values?.[0]?.id     ?? null,
        }));
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

        const apiUserId = userAttribute.user.apiUserId || userAttribute.user.id;

        if ( apiUserId !== currentUser.id ) {
            throw new ForbiddenException( 'You do not have permission to this attribute' );
        }

        return userAttribute;
    }


    async update(
        currentUser: User,
        updateUserAttributeInput: UpdateUserAttributeInput
    ): Promise<UserAttribute> {
        try {
            const userAttribute     = await this.findOne( currentUser, updateUserAttributeInput.id );
            const oldDefaultValue   = userAttribute.defaultValue;
            const updatedAttribute  = await this.prisma.userAttribute.update({
                where: {
                    id      : updateUserAttributeInput.id,
                    version : userAttribute.version
                },
                data: {
                    ...updateUserAttributeInput,
                    version: userAttribute.version + 1
                }
            });

            const hasDefaultValueChanged = 
                updateUserAttributeInput.defaultValue !== undefined && 
                JSON.stringify( updateUserAttributeInput.defaultValue ) !== JSON.stringify( oldDefaultValue );

            if ( hasDefaultValueChanged ) {
                const subordinateUsers = await this.prisma.user.findMany({
                    where   : { apiUserId: currentUser.id },
                    select  : { id: true }
                });

                const attributeValuesUpdate = subordinateUsers.map( user => ({
                    userId          : user.id,
                    userAttributeId : updatedAttribute.id,
                    value           : updateUserAttributeInput.defaultValue,
                }));

                await this.prisma.userAttributeValue.updateMany({
                    data: attributeValuesUpdate
                });

                const allRelevantUserIds = subordinateUsers.map( u => u.id );
                allRelevantUserIds.push( currentUser.id );

                if ( updateUserAttributeInput.defaultValue === null ) {
                    await this.prisma.userAttributeValue.deleteMany({
                        where: {
                            userAttributeId : updatedAttribute.id,
                            userId          : {
                                in: allRelevantUserIds
                            }
                        }
                    });
                } else {
                    await this.prisma.userAttributeValue.updateMany({
                        where: {
                            userAttributeId : updatedAttribute.id,
                            userId          : {
                                in: allRelevantUserIds
                            }
                        },
                        data: {
                            value: updateUserAttributeInput.defaultValue
                        }
                    });
                }
            }

            return updatedAttribute;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Attribute' );
        }
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
