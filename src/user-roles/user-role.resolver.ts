import { ParseUUIDPipe, UseGuards }     from '@nestjs/common';
import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';

import { CurrentUser }              from '@auth/decorators/current-user.decorator';
import { SecretAuthGuard }          from '@auth/guards/jwt-auth.guard';
import { UserRolesService }         from '@user-roles/user-roles.service';
import { UserRole }                 from '@user-roles/entities/user-role.entity';
import { AsignUsersRolesInput }     from '@user-roles/dto/asign-users-roles.input';
import { AssignUsersRolesResponse } from '@user-roles/entities/user-role-data.entity';
import { User }                     from '@user/entities/user.entity';


@UseGuards( SecretAuthGuard( false ))
@Resolver(() => UserRole)
export class UserRolesResolver {

    constructor(
        private readonly userRolesService: UserRolesService
    ) {}


    @Mutation(() => UserRole , { name: 'assignRoleToUser' })
    assignRoleToUser(
        @Args( 'roleId', { type: () => ID }) roleId: string,
        @Args( 'userId', { type: () => ID }) userId: string,
        @CurrentUser() currentUser: User
    ) {
        return this.userRolesService.assignRoleToUser( roleId, userId, currentUser );
    }


    @Mutation(() => AssignUsersRolesResponse, { name: 'asignManyRolesToUsers' })
    asignManyRolesToUsers(
        @CurrentUser() currentUser: User,
        @Args( 'asignRolesUsersInput' ) asignRolesUsersInput: AsignUsersRolesInput
    ) {
        return this.userRolesService.asignManyRolesToUsers( currentUser, asignRolesUsersInput );
    }


    @Mutation(() => UserRole, { name: 'removeUserRole' })
    removeUserRole(
        @Args('id', { type: () => ID }, ParseUUIDPipe ) id: string,
        @CurrentUser() currentUser: User
    ) {
        return this.userRolesService.remove( id, currentUser );
    }


    @Mutation(() => AssignUsersRolesResponse, { name: 'removeManyUserRoles' })
    removeManyById(
        @CurrentUser() currentUser: User,
        @Args('ids', { type: () => [ID] } ) ids: string[]
    ) {
        return this.userRolesService.removeManyByIds( currentUser, ids );
    }

}
