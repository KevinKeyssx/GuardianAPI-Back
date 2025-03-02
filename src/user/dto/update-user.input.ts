import { InputType, PartialType } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

import { CreateUserInput } from '@user/dto/create-user.input';


@InputType()
export class UpdateUserInput extends PartialType( CreateUserInput ) {

    @IsUUID()
    id: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

    @IsOptional()
    @IsString()
    googleId?: string;

    @IsOptional()
    @IsString()
    microsoftId?: string;

    @IsOptional()
    @IsString()
    facebookId?: string;

    @IsOptional()
    @IsString()
    githubId?: string;

    @IsOptional()
    @IsString()
    appleId?: string;

    @IsOptional()
    @IsString()
    otherId?: string;

}
