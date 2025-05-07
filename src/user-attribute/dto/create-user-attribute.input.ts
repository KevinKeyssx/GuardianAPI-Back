import { Field, InputType } from '@nestjs/graphql';

import {
    IsBoolean,
    IsDateString,
    IsDefined,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    Max,
    Min
}                       from 'class-validator';
import { GraphQLJSON  } from 'graphql-scalars';

import { AttributeType } from '@user-attribute/enums/attribute-type.enum';


@InputType()
export class CreateUserAttributeInput {

    @IsString()
    @IsDefined()
    @Field(() => String)
    key: string;

    @IsOptional()
    @Field(() => GraphQLJSON, { nullable: true })
    defaultValue?: any;

    @IsBoolean()
    @IsOptional()
    @Field( () => Boolean, { nullable: true })
    isActive: boolean = true;

    @IsEnum( AttributeType )
    @IsDefined()
    @Field( () => AttributeType )
    type: AttributeType;

    @IsOptional()
    @IsNumber()
    @Min( 0 )
    @Field( () => Number, { nullable: true })
    min?: number;

    @IsOptional()
    @IsNumber()
    @Max( 1000000 )
    @Field( () => Number, { nullable: true })
    max?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Field( () => Number, { nullable: true })
    minLength?: number;

    @IsOptional()
    @IsInt()
    @Max( 1000 )
    @Field( () => Number, { nullable: true })
    maxLength?: number;

    @IsOptional()
    @Matches(/^[a-zA-Z0-9-_]*$/)
    @Field( () => String, { nullable: true })
    pattern?: string;

    @IsBoolean()
    @IsOptional()
    @Field( () => Boolean, { nullable: true })
    required: boolean = false;

    @IsOptional()
    @IsDateString()
    @Field( () => String, {  nullable: true })
    maxDate?: string;

    @IsOptional()
    @IsDateString()
    @Field( () => String, {  nullable: true })
    minDate?: string;

}
