import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { UserPermissionsService } from './user-permissions.service';
import { UserPermission } from './entities/user-permission.entity';
import { CreateUserPermissionInput } from './dto/create-user-permission.input';
import { UpdateUserPermissionInput } from './dto/update-user-permission.input';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@user/entities/user.entity';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver(() => UserPermission)
export class UserPermissionsResolver {
    constructor(private readonly userPermissionsService: UserPermissionsService) {}

    @Mutation(() => UserPermission)
    createUserPermission(
        @Args('createUserPermissionInput') createUserPermissionInput: CreateUserPermissionInput,
        @CurrentUser() currentUser: User,
    ) {
        return this.userPermissionsService.assignPermissionToUser( createUserPermissionInput, currentUser );
    }

    @Query(() => [UserPermission], { name: 'userPermissions' })
    findAll(
        @CurrentUser() currentUser: User,
    ) {
        return this.userPermissionsService.findAll( currentUser );
    }

    @Query(() => UserPermission, { name: 'userPermission' })
    findOne(
        @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
        @CurrentUser() currentUser: User,
    ) {
        return this.userPermissionsService.findOne(id, currentUser);
    }

    // @Mutation(() => UserPermission)
    // updateUserPermission(
    //     @Args('updateUserPermissionInput') updateUserPermissionInput: UpdateUserPermissionInput,
    //     @CurrentUser() currentUser: User,
    // ) {
    //     return this.userPermissionsService.update( updateUserPermissionInput, currentUser );
    // }


    @Mutation(() => UserPermission)
    removeUserPermission(
        @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
        @CurrentUser() currentUser: User,
    ) {
        return this.userPermissionsService.remove( id, currentUser );
    }
}
