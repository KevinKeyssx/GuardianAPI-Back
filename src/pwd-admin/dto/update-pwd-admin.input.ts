import { InputType, Field, Int } from '@nestjs/graphql';

import {
    IsNumber,
    IsPositive,
    Max,
    Min,
} from 'class-validator';


@InputType()
export class UpdatePwdAdminInput {

    @IsNumber()
    @IsPositive()
    @Field( () => Int )
    @Min( 1 )
    @Max( 30 )
    alertDay: number;

    @IsNumber()
    @IsPositive()
    @Field( () => Int )
    @Min( 1 )
    @Max( 90 )
    howOften: number;

}
