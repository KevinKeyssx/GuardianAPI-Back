import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

import { RolesService }     from '@roles/roles.service';
import { Role }             from '@roles/entities/role.entity';
import { CreateRoleInput }  from '@roles/dto/create-role.input';
import { UpdateRoleInput }  from '@roles/dto/update-role.input';


@Resolver( () => Role )
export class RolesResolver {

    constructor(
        private readonly rolesService: RolesService
    ) {}


    @Mutation(() => Role )
    createRole(
        @Args( 'createRoleInput' ) createRoleInput: CreateRoleInput
    ) {
        return this.rolesService.create( createRoleInput );
    }


    @Mutation(() => Role , { name: 'assignRoleToUser' })
    assignRoleToUser(
        @Args( 'roleId', { type: () => ID }) roleId: string,
        @Args( 'userId', { type: () => ID }) userId: string
    ) {
        return this.rolesService.assignRoleToUser( roleId, userId );
    }


    @Query(() => [Role], { name: 'roles' })
    findAll() {
        return this.rolesService.findAll();
    }


    @Query(() => Role, { name: 'role' })
    findOne(
        @Args( 'id', { type: () => ID }) id: string
    ) {
        return this.rolesService.findOne( id );
    }


    @Mutation( () => Role )
    updateRole(
        @Args( 'updateRoleInput' ) updateRoleInput: UpdateRoleInput
    ) {
        return this.rolesService.update( updateRoleInput );
    }


    @Mutation( () => Role )
    removeRole(
        @Args('id', { type: () => ID }) id: string
    ) {
        return this.rolesService.remove( id );
    }

}
