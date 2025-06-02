import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit,
    UnauthorizedException
} from '@nestjs/common';

import { PrismaClient, UserAttribute }  from '@prisma/client';
import { isUUID }                       from 'class-validator';

import { CreateUserAttributeValueInput }        from '@user-attribute-values/dto/create-user-attribute-value.input';
import { AttributeType, AttributeTypeValue }    from '@user-attribute/enums/attribute-type.enum';
import { PrismaException }                      from '@config/prisma-catch';
import { User }                                 from '@user/entities/user.entity';


@Injectable()
export class UserAttributeValuesService implements OnModuleInit {

    constructor(
        @Inject( 'PRISMA_CLIENT' ) private readonly prisma: PrismaClient
    ) {}


    onModuleInit() {
		this.prisma.$connect();
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


    async create(
        { value, userAttributeId, userId }: CreateUserAttributeValueInput,
        currentUser: User
    ) {
        const userAttribute = await this.prisma.userAttribute.findUnique({
            where: {
                id: userAttributeId,
                userId: currentUser.apiUserId ?? currentUser.id
            }
        });

        if ( !userAttribute ) {
            throw new NotFoundException( `User attribute whit id ${userAttributeId} not found.` );
        }

        if ( !this.#isValidType( value, userAttribute.type as AttributeType )) {
            throw new BadRequestException( `Invalid type for value. Expected ${userAttribute.type}.` );
        }

        const error = this.#validateConstraints( value, userAttribute );

        if ( error ) throw new BadRequestException( error );

        try {
            return await this.prisma.userAttributeValue.create({
                data: { value, userAttributeId, userId },
                include: {
                    userAttribute: true,
                    user: true
                }
            });
        } catch( error ) {
            throw PrismaException.catch( error, 'Attribute Value' );
        }
    }


    findAllByApiUser( currentUser: User ) {
        return this.prisma.userAttributeValue.findMany({
            where: {
                userId: currentUser.apiUserId
            }
        });
    }


    findAllByUser( currentUser: User ) {
        return this.prisma.userAttributeValue.findMany({
            where: {
                userId: currentUser.id
            }
        });
    }


    async findOne( id: string, currentUser: User ) {
        const attribute = await this.prisma.userAttributeValue.findUnique({
            where: {
                id,
                userId: currentUser.apiUserId
            }
        });

        if ( !attribute ) throw new NotFoundException( `Attribute whit id ${id} not found` );

        return attribute;
    }


    async update(
        id          : string,
        value       : AttributeTypeValue,
        currentUser : User
    ) {
        try {
            const attribute = await this.prisma.userAttributeValue.findUnique({
                where   : {
                    id,
                    userId: currentUser.id
                },
                include : {
                    userAttribute   : true,
                    user            : true
                }
            });

            if ( !attribute ) throw new NotFoundException( `Attribute whit id ${id} not found` );

            if ( !this.#isValidType( value, attribute.userAttribute.type as AttributeType )) {
                throw new BadRequestException( `Invalid type for value. Expected ${attribute.userAttribute.type}.` );
            }

            const error = this.#validateConstraints( value, attribute.userAttribute );

            if ( error ) throw new BadRequestException( error );

            return await this.prisma.userAttributeValue.update({
                where   : { id, userId: currentUser.id },
                data    : { value },
                include : {
                    userAttribute   : true,
                    user            : true
                }
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Attribute Value' );
        }
    }


    async updateByApiUser(
        id          : string,
        value       : AttributeTypeValue,
        currentUser : User
    ) {
        try {
            const attribute = await this.prisma.userAttributeValue.findUnique({
                where   : { id },
                include : {
                    userAttribute   : true,
                    user            : true
                }
            });

            if ( !attribute ) throw new NotFoundException( `Attribute whit id ${id} not found` );
            if ( attribute.user.apiUserId !== currentUser.apiUserId ) {
                throw new UnauthorizedException( 'You are not authorized to update this attribute' );
            }

            if ( !this.#isValidType( value, attribute.userAttribute.type as AttributeType )) {
                throw new BadRequestException( `Invalid type for value. Expected ${attribute.userAttribute.type}.` );
            }

            const error = this.#validateConstraints( value, attribute.userAttribute );

            if ( error ) throw new BadRequestException( error );

            return await this.prisma.userAttributeValue.update({
                where   : { id },
                data    : { value },
                include : {
                    userAttribute   : true,
                    user            : true
                }
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Attribute Value' );
        }
    }

}
