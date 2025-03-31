import {
    Resolver,
    Query,
    Mutation,
    Args,
    ID,
    ResolveField,
    Parent,
    Context
}                                   from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { SecretAuthGuard }      from '@auth/guards/jwt-auth.guard';
import { CurrentUser }          from '@auth/decorators/current-user.decorator';
import { hideUserMiddleware }   from '@config/hideIfNotApi';
import { SearchArgs }           from '@common/dto/args/search.args';
import { AttributesArgs }       from '@common/dto/args/attributes.args';
import { PaginationArgs }       from '@common/dto/args/pagination.args';
import { UserService }          from '@user/user.service';
import { UpdateUserInput }      from '@user/dto/update-user.input';
import { User }                 from '@user/entities/user.entity';
import { UserResponse }         from '@user/entities/user-response.';
import { Role }                 from '@roles/entities/role.entity';
import { RolesService }         from '@roles/roles.service';
import { UserAttributeService } from '@user-attribute/user-attribute.service';
import { UserAttribute }        from '@user-attribute/entities/user-attribute.entity';


@Resolver( () => UserResponse )
export class UserResolver {

    constructor(
        private readonly userService            : UserService,
        private readonly rolesService           : RolesService,
        private readonly userAttributeService   : UserAttributeService
    ) {}


    @UseGuards( SecretAuthGuard( false ))
    @Query(() => [UserResponse], { name: 'users' })
    findAll(
        @CurrentUser() user : User,
        @Args() search      : SearchArgs,
        @Args() pagination  : PaginationArgs
    ) {
        return this.userService.findAll( user, pagination, search );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Query(() => UserResponse, { name: 'user' })
    findOne(
        @CurrentUser() user: User,
        @Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
        @Context() context: any
    ) {
        context.userId = id;
        return this.userService.findOne( user, id );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Mutation( () => UserResponse )
    updateUser(
        @CurrentUser() user: User,
        @Args( 'updateUserInput' ) updateUserInput: UpdateUserInput
    ) {
        return this.userService.update( user, updateUserInput );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Mutation( () => Boolean )
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
    @ResolveField( () => [Role], {
        name        : 'roles',
        middleware  : [ hideUserMiddleware ]
    })
    getRolesByUser(
        @Parent() user      : User,
        @Args() search      : SearchArgs,
        @Args() pagination  : PaginationArgs
    ) {
        return this.rolesService.findAll( user, pagination, search );
    }


    @ResolveField( () => [UserResponse], {
        name        : 'users',
        middleware  : [ hideUserMiddleware ]
    })
    getUserRelations(
        @Parent() user      : User,
        @Args() search      : SearchArgs,
        @Args() pagination  : PaginationArgs
    ) {
        return this.userService.findAll( user, pagination, search );
    }


    @ResolveField( () => [UserAttribute], { name: 'attributes' })
    getAttributes(
        @Parent() user      : User,
        @Context() context  : any,
        @Args() attributes  : AttributesArgs
    ) {
        return this.userAttributeService.findAll( user, context.userId, attributes );
    }

}
