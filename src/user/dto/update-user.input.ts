import { Field, ID, InputType } from '@nestjs/graphql';
import { PartialType }          from '@nestjs/swagger';

import { IsUUID } from 'class-validator';

import { CreateUserInput } from './create-user.input';


@InputType()
export class UpdateUserInput extends PartialType( CreateUserInput ) {

    @Field( () => ID )
    @IsUUID()
    id: string;

}
