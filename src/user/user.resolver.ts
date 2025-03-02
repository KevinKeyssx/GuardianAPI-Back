import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

import { UserService }      from '@user/user.service';
import { User }             from '@user/entities/user.entity';
import { CreateUserInput }  from '@user/dto/create-user.input';
import { UpdateUserInput }  from '@user/dto/update-user.input';


@Resolver( () => User )
export class UserResolver {

    constructor(
        private readonly userService: UserService
    ) {}


    @Mutation( () => User )
    createUser(
        @Args( 'createUserInput' ) createUserInput: CreateUserInput
    ) {
        return this.userService.create( createUserInput );
    }


    @Query(() => [User], { name: 'users' })
    findAll() {
        return this.userService.findAll();
    }


    @Query(() => User, { name: 'user' })
    findOne(
        @Args( 'id', { type: () => ID }) id: string
    ) {
        return this.userService.findOne( id );
    }


    @Mutation( () => User )
    updateUser(
        @Args( 'updateUserInput' ) updateUserInput: UpdateUserInput
    ) {
        return this.userService.update( updateUserInput );
    }


    @Mutation( () => User )
    removeUser(
        @Args( 'id', { type: () => ID }) id: string
    ) {
        return this.userService.remove( id );
    }

}
