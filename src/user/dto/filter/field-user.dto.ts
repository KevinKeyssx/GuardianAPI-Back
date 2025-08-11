import { ArgsType, Field } from "@nestjs/graphql";

import { IsEnum, IsOptional } from "class-validator";


export enum FieldUserEnum {
    Email       = 'email',
    Nickname    = 'nickname',
    Name        = 'name',
    Phone       = 'phone',
}

export enum FieldOrderUserEnum {
    CreatedAt   = 'createdAt',
    UpdatedAt   = 'updatedAt',
    Name        = 'name',
    Email       = 'email',
    Nickname    = 'nickname',
    Phone       = 'phone',
    Birthday    = 'birthday',
}


@ArgsType()
export class FieldUserArgs {

    @IsOptional()
    @IsEnum([ 'email', 'nickname', 'name', 'phone' ])
    @Field( () => String, { nullable: true })
    field : FieldUserEnum = FieldUserEnum.Email;

    @IsOptional()
    @IsEnum([ 'createdAt', 'updatedAt', 'name', 'email', 'nickname', 'phone', 'birthday' ])
    @Field( () => String, { nullable: true })
    orderField : FieldOrderUserEnum = FieldOrderUserEnum.CreatedAt;

}
