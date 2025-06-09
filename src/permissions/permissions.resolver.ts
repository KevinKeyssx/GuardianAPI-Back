import { ParseUUIDPipe, UseGuards }                            from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

import { CurrentUser }              from '@auth/decorators/current-user.decorator';
import { SecretAuthGuard }          from '@auth/guards/jwt-auth.guard';
import { SearchArgs }               from '@common/dto/args/search.args';
import { PaginationArgs }           from '@common/dto/args/pagination.args';
import { PermissionsService }       from '@permissions/permissions.service';
import { Permission }               from '@permissions/entities/permission.entity';
import { CreatePermissionInput }    from '@permissions/dto/create-permission.input';
import { UpdatePermissionInput }    from '@permissions/dto/update-permission.input';
import { User }                     from '@user/entities/user.entity';


@UseGuards( SecretAuthGuard( false ))
@Resolver( () => Permission )
export class PermissionsResolver {
    constructor(
        private readonly permissionsService: PermissionsService
    ) {}


    @Mutation( () => Permission )
    createPermission(
        @CurrentUser() currentUser: User,
        @Args( 'createPermissionInput' ) createPermissionInput: CreatePermissionInput
    ) {
        return this.permissionsService.create( currentUser, createPermissionInput );
    }


    @Query(() => [Permission], { name: 'permissions' })
    findAll(
        @CurrentUser() currentUser  : User,
        @Args() paginationArgs      : PaginationArgs,
        @Args() searchArgs          : SearchArgs
    ) {
        return this.permissionsService.findAll( currentUser, paginationArgs, searchArgs );
    }


    @Query(() => Permission, { name: 'permission' })
    findOne(
        @Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
        @CurrentUser() currentUser: User
    ) {
        return this.permissionsService.findOne( id, currentUser );
    }


    @Mutation( () => Permission )
    updatePermission(
        @Args('updatePermissionInput') updatePermissionInput: UpdatePermissionInput,
        @CurrentUser() currentUser: User
    ) {
        return this.permissionsService.update( updatePermissionInput, currentUser );
    }


    @Mutation( () => Permission )
    removePermission(
        @Args('id', { type: () => ID }, ParseUUIDPipe ) id: string,
        @CurrentUser() currentUser: User
    ) {
        return this.permissionsService.remove( id, currentUser );
    }

}
