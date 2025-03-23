import { InputType, Field } from '@nestjs/graphql';

import {
    IsString,
    Length,
    Matches
} from 'class-validator';


@InputType()
export class UpdatePwdInput {

    @IsString()
    @Length( 8, 100 )
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,100}$/, {
        message: 'Password must have at least 8 characters, one uppercase, one lowercase, one number, and one special character.'
    })
    @Field( () => String )
    currentPassword: string;

    @IsString()
    @Length( 8, 100 )
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,100}$/, {
        message: 'Password must have at least 8 characters, one uppercase, one lowercase, one number, and one special character.'
    })
    @Field( () => String )
    newPassword: string;

}
