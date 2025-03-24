import { ParseUUIDPipe, UseGuards }                             from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID, ResolveField }    from '@nestjs/graphql';

import { SecretAuthGuard }      from '@auth/guards/jwt-auth.guard';
import { CurrentUser }          from '@auth/decorators/current-user.decorator';
import { SearchArgs }           from '@common/dto/args/search.args';
import { hideUserMiddleware }   from '@config/hideIfNotApi';
import { PaginationArgs }       from '@common/dto/args/pagination.args';
import { UserService }          from '@user/user.service';
import { User }                 from '@user/entities/user.entity';
import { UpdateUserInput }      from '@user/dto/update-user.input';
import { Role }                 from '@roles/entities/role.entity';
import { RolesService }         from '@roles/roles.service';


@Resolver( () => User )
export class UserResolver {

    constructor(
        private readonly userService    : UserService,
        private readonly rolesService   : RolesService
    ) {}


    @UseGuards( SecretAuthGuard( false ))
    @Query(() => [User], { name: 'users' })
    findAll(
        @CurrentUser() user : User,
        @Args() search      : SearchArgs,
        @Args() pagination  : PaginationArgs
    ) {
        return this.userService.findAll( user, pagination, search );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Query(() => User, { name: 'user' })
    findOne(
        @CurrentUser() user: User,
        @Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string
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
        @Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string
    ) {
        return this.userService.remove( user, id );
    }

    /**
     * ResolveFields
     * @param user
     * @param search
     * @param pagination
     * @returns
     * */
    @UseGuards( SecretAuthGuard( false ))
    @ResolveField( () => [Role], {
        name        : 'roles',
        middleware  : [ hideUserMiddleware ]
    })
    getRolesByUser(
        @CurrentUser() user : User,
        @Args() search      : SearchArgs,
        @Args() pagination  : PaginationArgs
    ) {
        return this.rolesService.findAll( user, pagination, search );
    }


    @UseGuards( SecretAuthGuard( false ))
    @ResolveField( () => [User], {
        name        : 'users',
        middleware  : [ hideUserMiddleware ]
    })
    getUserRelations(
        @CurrentUser() user : User,
        @Args() search      : SearchArgs,
        @Args() pagination  : PaginationArgs
    ) {
        return this.userService.findAll( user, pagination, search );
    }

}
