import { ObjectType, Field } from '@nestjs/graphql';

import { GraphQLJSON  } from 'graphql-scalars';

import { AttributeType } from '@user-attribute/enums/attribute-type.enum';


@ObjectType()
export class UserAttribute {

    @Field( () => String )
    key: string;

    @Field( () => GraphQLJSON, { nullable: true })
    value?: any;

    @Field( () => GraphQLJSON, { nullable: true } )
    defaultValue?: any;

    @Field( () => Boolean )
    isActive: boolean;

    @Field( () => AttributeType )
    type: AttributeType;

    @Field( () => Number, { nullable: true })
    min?: number;

    @Field( () => Number, { nullable: true })
    max?: number;

    @Field( () => Number, { nullable: true })
    minLength?: number;

    @Field( () => Number, { nullable: true })
    maxLength?: number;

    @Field( () => String, { nullable: true })
    pattern?: string;

    @Field( () => Boolean, { nullable: true })
    required: boolean = false;

    @Field( () => Date, {  nullable: true })
    maxDate?: Date;

    @Field( () => Date, {  nullable: true })
    minDate?: Date;

}