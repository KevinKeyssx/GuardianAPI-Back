import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import {
    AttributeType,
    PrismaClient,
    UserAttribute
}                               from '@prisma/client';
import { validate as isUUID }   from 'uuid';

import { CreateUserAttributeInput }         from '@user-attribute/dto/create-user-attribute.input';
import { UpdateUserAttributeInput }         from '@user-attribute/dto/update-user-attribute.input';
import { UpdateValueUserAttributeInput }    from '@user-attribute/dto/update-value-user-attribute.input';
import { ValueAttribute }                   from '@user-attribute/entities/value-attribute.entity';


@Injectable()
export class UserAttributeService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
		this.$connect();
	}


    async create(
        createUserAttributeInput: CreateUserAttributeInput
    ): Promise<UserAttribute> {
        const existUserAttibute = await this.userAttribute.findFirst({
            where: {
                userId  : createUserAttributeInput.userId,
                key     : createUserAttributeInput.key
            }
        });

        if ( existUserAttibute ) {
            throw new BadRequestException( 'Key attribute already exists' );
        }

        return this.userAttribute.create({
            data: {
                ...createUserAttributeInput,
                value: createUserAttributeInput.defaultValue ?? null
            }
        });
    }


    async findAll(
        userId: string
    ): Promise<UserAttribute[]> {
        return await this.userAttribute.findMany({
            where: {
                userId,
                isActive: true
            }
        });
    }


    async findOne( id: string ): Promise<UserAttribute> {
        const userAttribute = await this.userAttribute.findUnique({
            where: {
                id,
                isActive: true
            }
        });

        if ( !userAttribute ) {
            throw new NotFoundException( `User attribute whit id ${id} not found.` );
        }

        return userAttribute;
    }


    async update(
        updateUserAttributeInput: UpdateUserAttributeInput
    ): Promise<UserAttribute> {
        const userAttribute = await this.findOne( updateUserAttributeInput.id );

        if ( userAttribute.value !== updateUserAttributeInput.value ) {
            throw new BadRequestException( "Value attribute can't be updated" );
        }

        return await this.userAttribute.update({
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
        updateUserAttributeInput: UpdateValueUserAttributeInput
    ): Promise<ValueAttribute> {
        const userAttribute = await this.findOne( updateUserAttributeInput.id );

        if ( userAttribute.required && !updateUserAttributeInput.value ) {
            throw new BadRequestException( 'Value is required' );
        }

        if ( !this.#isValidType( updateUserAttributeInput.value, userAttribute.type )) {
            throw new BadRequestException( `Invalid type for value. Expected ${userAttribute.type}.` );
        }

        const error = this.#validateConstraints( updateUserAttributeInput.value, userAttribute );

        if ( error ) throw new BadRequestException( error );

        await this.userAttribute.update({
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


    async remove( id: string ): Promise<UserAttribute> {
        await this.findOne( id );

        return await this.userAttribute.delete({
            where: {
                id
            }
        });
    }

}
