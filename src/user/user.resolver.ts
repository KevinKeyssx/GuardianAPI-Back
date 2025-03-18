import { UseGuards }                            from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID }  from '@nestjs/graphql';

import { SecretAuthGuard }  from '@auth/guards/jwt-auth.guard';
import { CurrentUser }      from '@auth/decorators/current-user.decorator';
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
    findAll(
        @CurrentUser() user: User
    ) {
        return this.userService.findAll( user );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Query(() => User, { name: 'user' })
    findOne(
        @CurrentUser() user: User,
        @Args( 'id', { type: () => ID }) id: string
    ) {
        return this.userService.findOne( user, id );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Mutation( () => User )
    updateUser(
        @CurrentUser() user: User,
        @Args( 'updateUserInput' ) updateUserInput: UpdateUserInput
    ) {
        return this.userService.update( user, updateUserInput );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Mutation( () => User )
    removeUser(
        @CurrentUser() user: User,
        @Args( 'id', { type: () => ID }) id: string
    ) {
        return this.userService.remove( user, id );
    }

}
