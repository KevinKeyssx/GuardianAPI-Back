import { ForbiddenException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

import { PrismaException }                  from '@config/prisma-catch';
import { CreateUserPermissionInput }        from '@user-permissions/dto/create-user-permission.input';
import { UserPermission }                   from '@user-permissions/entities/user-permission.entity';
import { AssignUsersPermissionsInput }      from '@user-permissions/dto/assign-users-permissions.input';
import { AssignUsersPermissionsResponse }   from '@user-permissions/entities/user-permission-data.entity';
import { User } from '@user/entities/user.entity';


@Injectable()
export class UserPermissionsService implements OnModuleInit {
    constructor(
        @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    ) {}

    onModuleInit() {
        this.prisma.$connect();
    }

    async assignPermissionToUser(
        { userId, permissionId }: CreateUserPermissionInput,
        currentUser: User,
    ): Promise<UserPermission> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { apiUserId: true, id: true },
        });

        if (!user) throw new NotFoundException(`User with id ${userId} not found.`);
        // Ensure the currentUser can manage permissions for the target user
        // This logic might need adjustment based on your exact authorization rules (e.g., admin or owner)
        if (user.apiUserId !== currentUser.id && user.id !== currentUser.id ) {
            throw new ForbiddenException('You are not allowed to assign a permission to this user.');
        }

        const permission = await this.prisma.permission.findUnique({
            where: { id: permissionId },
            select: { id: true } // Removed createdById as it's not standard and causing lint errors
        });

        if (!permission) throw new NotFoundException(`Permission with id ${permissionId} not found.`);
        // Optional: Check if the currentUser is allowed to assign this specific permission
        // if (permission.createdById !== currentUser.id && !currentUser.isSuperUser) { // Example check
        //     throw new ForbiddenException('You are not allowed to assign this permission.');
        // }

        try {
        return await this.prisma.userPermission.create({
            data: {
            userId,
            permissionId,
            },
            include: {
            user: true,
            permission: true,
            },
        }) as UserPermission;
        } catch (error) {
        throw PrismaException.catch(error, 'UserPermission');
        }
    }

    async assignManyPermissionsToUsers(
        currentUser: User,
        { userIds, permissionIds }: AssignUsersPermissionsInput,
    ): Promise<AssignUsersPermissionsResponse> {
        const users = await this.prisma.user.findMany({
        where: { 
            id: { in: userIds }, 
            // Adjust authorization: either users managed by currentUser or currentUser themselves if not superuser
            OR: [
                { apiUserId: currentUser.id },
                { id: currentUser.id }
            ]
        },
        select: { id: true },
        });
        if (users.length !== userIds.length) {
            const foundUserIds = users.map(u => u.id);
            const notFoundOrUnauthorized = userIds.filter(id => !foundUserIds.includes(id));
            if (notFoundOrUnauthorized.length > 0) {
                // Handle case where some users are not found or not authorized for non-superusers
                // This part of the logic might need refinement based on how you want to report errors
            }
        }
        const validUserIds = users.map(user => user.id);

        const permissions = await this.prisma.permission.findMany({
        where: { 
            id: { in: permissionIds },
            // Optional: Add authorization for permissions if they are scoped
            // e.g., createdById: currentUser.id (if permissions are user-specific)
        },
        select: { id: true },
        });
        const validPermissionIds = permissions.map(permission => permission.id);

        const invalidUsers = userIds.filter(id => !validUserIds.includes(id));
        const invalidPermissions = permissionIds.filter(id => !validPermissionIds.includes(id));

        const permissionAssignments = validUserIds.flatMap(userId =>
        validPermissionIds.map(permissionId => ({ userId, permissionId })),
        );

        try {
        if (permissionAssignments.length > 0) {
            await this.prisma.userPermission.createMany({ data: permissionAssignments, skipDuplicates: true });
        }

        const createdAssignments = await this.prisma.userPermission.findMany({
            where: { OR: permissionAssignments },
            include: { user: true, permission: true },
        });

        return {
            success: createdAssignments as UserPermission[],
            errors: [
            ...invalidUsers.map(id => ({ userId: id, error: 'User not found or unauthorized' })),
            ...invalidPermissions.map(id => ({ permissionId: id, error: 'Permission not found or unauthorized' })),
            ],
        } as AssignUsersPermissionsResponse;
        } catch (error) {
        throw PrismaException.catch(error);
        }
    }

    async remove(id: string, currentUser: User): Promise<UserPermission> {
        const userPermission = await this.prisma.userPermission.findUnique({
        where: { id },
        include: { user: true }, // Include user to check for apiUserId
        });

        if (!userPermission) throw new NotFoundException('UserPermission not found');
        if (userPermission.user.apiUserId !== currentUser.id && userPermission.user.id !== currentUser.id ) {
        throw new ForbiddenException("You don't have permission to remove this user-permission.");
        }

        try {
        return await this.prisma.userPermission.delete({
            where: { id },
            include: { user: true, permission: true },
        }) as UserPermission;
        } catch (error) {
        throw PrismaException.catch(error, 'UserPermission');
        }
    }

    async removeManyPermissionsByIds(
        currentUser: User,
        ids: string[],
    ): Promise<AssignUsersPermissionsResponse> {
        const userPermissions = await this.prisma.userPermission.findMany({
        where: { id: { in: ids } },
        include: { user: true, permission: true }, // Include user for auth check and permission for response
        });

        const validUserPermissions = userPermissions.filter(
            up => up.user.apiUserId === currentUser.id || up.user.id === currentUser.id
        );

        const invalidUserPermissionIds = ids.filter(id => !validUserPermissions.some(up => up.id === id));

        if (validUserPermissions.length > 0) {
        await this.prisma.userPermission.deleteMany({
            where: { id: { in: validUserPermissions.map(up => up.id) } },
        });
        }

        return {
        success: validUserPermissions.map(({ id, user, permission }) => ({
            id,
            userId: user.id,
            permissionId: permission.id,
            user,
            permission,
        })) as UserPermission[], // Casting here might need adjustment based on UserPermission entity structure
        errors: invalidUserPermissionIds.map(id => ({
            error: 'UserPermission not found or unauthorized',
            // We don't have userId or permissionId directly for these errors without another query
            // For simplicity, just marking the ID that failed.
            permissionId: id, // Or some other way to identify the error source
        })),
        } as AssignUsersPermissionsResponse;
    }

    // Placeholder for findAll - to be implemented if needed
    async findAll(currentUser: User): Promise<UserPermission[]> {
        // Basic implementation: find all user permissions the current user has access to
        // This might need more specific filtering based on roles/permissions of the currentUser
        // if (currentUser.isSuperUser) {
        //     return this.prisma.userPermission.findMany({ include: { user: true, permission: true }}) as Promise<UserPermission[]>;
        // }
        // For non-superusers, only return permissions related to users they manage or themselves
        return this.prisma.userPermission.findMany({
            where: {
                user: {
                    OR: [
                        { apiUserId: currentUser.id },
                        { id: currentUser.id }
                    ]
                }
            },
            include: { user: true, permission: true }
        }) as Promise<UserPermission[]>;
    }

    // Placeholder for findOne - to be implemented if needed
    async findOne(id: string, currentUser: User): Promise<UserPermission | null> {
        const userPermission = await this.prisma.userPermission.findUnique({
            where: { id },
            include: { user: true, permission: true }
        });

        if (!userPermission) return null;

        // Authorization check
        if ( userPermission.user.apiUserId === currentUser.id || userPermission.user.id === currentUser.id) {
            return userPermission as UserPermission;
        }

        throw new ForbiddenException('You are not authorized to view this user permission.');
    }

}
