import { InputType, Field, ID  } from '@nestjs/graphql';

import {
    IsString,
    IsUUID,
    Length,
    Matches
} from 'class-validator';


@InputType()
export class UpdatePwdInput {

    @IsUUID()
    @Field( () => ID )
    id: string;

    @IsString()
    @Length( 1, 255 )
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/, {
        message: 'Password must have at least 10 characters, one uppercase, one lowercase, one number, and one special character.'
    })
    @Field( () => String )
    password: string;

}
