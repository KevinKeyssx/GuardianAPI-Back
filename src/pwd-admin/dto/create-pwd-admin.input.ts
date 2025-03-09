import { InputType, Field } from '@nestjs/graphql';

import { IsString, IsUUID, Length } from 'class-validator';


@InputType()
export class CreatePwdAdminInput {

    @IsUUID()
    @Field( () => String )
    userId: string;

}
