import { ParseUUIDPipe, UseGuards }             from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID }  from '@nestjs/graphql';

import { SecretAuthGuard }  from '@auth/guards/jwt-auth.guard';
import { CurrentUser }      from '@auth/decorators/current-user.decorator';
import { SearchArgs }       from '@common/dto/args/search.args';
import { PaginationArgs }   from '@common/dto/args/pagination.args';
import { RolesService }     from '@roles/roles.service';
import { Role }             from '@roles/entities/role.entity';
import { CreateRoleInput }  from '@roles/dto/create-role.input';
import { UpdateRoleInput }  from '@roles/dto/update-role.input';
import { User }             from '@user/entities/user.entity';


@UseGuards( SecretAuthGuard( false ))
@Resolver( () => Role )
export class RolesResolver {

    constructor(
        private readonly rolesService: RolesService
    ) {}


    @Mutation(() => Role )
    createRole(
        @CurrentUser() currentUser: User,
        @Args( 'createRoleInput' ) createRoleInput: CreateRoleInput
    ) {
        return this.rolesService.create( currentUser, createRoleInput );
    }


    @Query(() => [Role], { name: 'roles' })
    findAll(
        @CurrentUser() currentUser  : User,
        @Args() paginationArgs      : PaginationArgs,
        @Args() searchArgs          : SearchArgs
    ) {
        return this.rolesService.findAll( currentUser, paginationArgs, searchArgs );
    }


    @Query(() => Role, { name: 'role' })
    findOne(
        @Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
        @CurrentUser() currentUser: User
    ) {
        return this.rolesService.findOne( id, currentUser );
    }


    @Mutation( () => Role )
    updateRole(
        @Args( 'updateRoleInput' ) updateRoleInput: UpdateRoleInput,
        @CurrentUser() currentUser: User
    ) {
        return this.rolesService.update( updateRoleInput, currentUser );
    }


    @Mutation( () => Role )
    removeRole(
        @Args('id', { type: () => ID }, ParseUUIDPipe ) id: string,
        @CurrentUser() currentUser: User
    ) {
        return this.rolesService.remove( id, currentUser );
    }

}
