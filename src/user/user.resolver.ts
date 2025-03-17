import { UseGuards }                            from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID }  from '@nestjs/graphql';

import { SecretAuthGuard }from '@auth/guards/jwt-auth.guard';
import { UserService }      from '@user/user.service';
import { User }             from '@user/entities/user.entity';
import { CreateUserInput }  from '@user/dto/create-user.input';
import { UpdateUserInput }  from '@user/dto/update-user.input';


@Resolver( () => User )
export class UserResolver {

    constructor(
        private readonly userService: UserService
    ) {}


    @UseGuards( SecretAuthGuard( false ))
    @Query(() => [User], { name: 'users' })
    findAll() {
        return this.userService.findAll();
    }


    @UseGuards( SecretAuthGuard( true ))
    @Query(() => User, { name: 'user' })
    findOne(
        @Args( 'id', { type: () => ID }) id: string
    ) {
        return this.userService.findOne( id );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Mutation( () => User )
    updateUser(
        @Args( 'updateUserInput' ) updateUserInput: UpdateUserInput
    ) {
        return this.userService.update( updateUserInput );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Mutation( () => User )
    removeUser(
        @Args( 'id', { type: () => ID }) id: string
    ) {
        return this.userService.remove( id );
    }

}
