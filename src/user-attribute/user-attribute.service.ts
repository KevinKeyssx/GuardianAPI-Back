import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import {
    AttributeType,
    PrismaClient,
    UserAttribute
}                               from '@prisma/client';
import { validate as isUUID }   from 'uuid';

import { PrismaException }                  from '@config/prisma-catch';
import { AttributesArgs }                   from '@common/dto/args/attributes.args';
import { CreateUserAttributeInput }         from '@user-attribute/dto/create-user-attribute.input';
import { UpdateUserAttributeInput }         from '@user-attribute/dto/update-user-attribute.input';
import { UpdateValueUserAttributeInput }    from '@user-attribute/dto/update-value-user-attribute.input';
import { ValueAttribute }                   from '@user-attribute/entities/value-attribute.entity';
import { User }                             from '@user/entities/user.entity';


@Injectable()
export class UserAttributeService implements OnModuleInit {

    constructor(
        @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient
    ) {}

    onModuleInit() {
		this.prisma.$connect();
	}


    async #validPermissions( userId: string, currentUser: User ): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { plan: true}
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
        const user      = await this.#validPermissions( createUserAttributeInput.userId, currentUser );
        const userCount = await this.prisma.user.count({ where: { apiUserId: user.apiUserId }});

        if ( userCount >= user.plan!.maxAttributes )
            throw new BadRequestException( 'Maximum attributes reached.' );

        try {
            return await this.prisma.userAttribute.create({
                data: {
                    ...createUserAttributeInput,
                    value: createUserAttributeInput.defaultValue ?? null
                }
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Attribute' );
        }
    }


    async findAll(
        currentUser : User,
        userId      : string,
        { keys }    : AttributesArgs
    ): Promise<UserAttribute[]> {
        await this.#validPermissions( userId, currentUser );

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
        await this.findOne( currentUser, updateUserAttributeInput.id );

        return await this.prisma.userAttribute.update({
            where: {
                id: updateUserAttributeInput.id
            },
            data: updateUserAttributeInput
        });
    }


    #isValidType = (
        value   : any,
        type    : AttributeType
    ): boolean => ({
        [AttributeType.STRING]      : typeof value === 'string',
        [AttributeType.NUMBER]      : typeof value === 'number' && Number.isInteger( value ),
        [AttributeType.BOOLEAN]     : typeof value === 'boolean',
        [AttributeType.DECIMAL]     : typeof value === 'number' && !Number.isInteger( value ),
        [AttributeType.LIST]        : Array.isArray( value ),
        [AttributeType.JSON]        : typeof value === 'object' && value !== null,
        [AttributeType.DATETIME]    : typeof value === 'string' && new Date( value ).toString() !== 'Invalid Date',
        [AttributeType.UUID]        : typeof value === 'string' && isUUID( value )
    }[type] || false );


    #validateConstraints = (
        value       : any,
        userAttr    : UserAttribute
    ): string | undefined => {
        const { min, max, minLength, maxLength, type, minDate, maxDate } = userAttr;

        if ( type === AttributeType.NUMBER || type === AttributeType.DECIMAL ) {
            if ( min !== null && value < min ) return `Value must be greater than or equal to ${min}`;
            if ( max !== null && value > max ) return `Value must be less than or equal to ${max}`;
        }

        if ( type === AttributeType.STRING || type === AttributeType.LIST ) {
            if ( minLength !== null && value.length < minLength ) return `Value must be at least ${minLength} characters long`;
            if ( maxLength !== null && value.length > maxLength ) return `Value must be at most ${maxLength} characters long`;
        }

        if ( type === AttributeType.DATETIME ) {
            if ( minDate !== null && new Date( value ) < new Date( minDate )) return `Value must be greater than or equal to ${minDate}`;
            if ( maxDate !== null && new Date( value ) > new Date( maxDate )) return `Value must be less than or equal to ${maxDate}`;
        }

        return undefined;
    };


    async updateValue(
        currentUser: User,
        updateUserAttributeInput: UpdateValueUserAttributeInput
    ): Promise<ValueAttribute> {
        const userAttribute = await this.findOne( currentUser, updateUserAttributeInput.id );

        if ( userAttribute.required && !updateUserAttributeInput.value ) {
            throw new BadRequestException( 'Value is required' );
        }

        if ( !this.#isValidType( updateUserAttributeInput.value, userAttribute.type )) {
            throw new BadRequestException( `Invalid type for value. Expected ${userAttribute.type}.` );
        }

        const error = this.#validateConstraints( updateUserAttributeInput.value, userAttribute );

        if ( error ) throw new BadRequestException( error );

        await this.prisma.userAttribute.update({
            where: {
                id: updateUserAttributeInput.id
            },
            data: {
                value: updateUserAttributeInput.value
            }
        });

        return {
            value: updateUserAttributeInput.value
        }
    }


    async remove( currentUser: User, id: string ): Promise<UserAttribute> {
        await this.findOne( currentUser, id );

        try {
            return await this.prisma.userAttribute.delete({
                where: {
                    id
                }
            });
        } catch (error) {
            throw PrismaException.catch( error, 'Attribute' );
        }
    }

}
