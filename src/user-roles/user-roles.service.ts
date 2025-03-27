import { ForbiddenException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

import { PrismaException }          from '@config/prisma-catch';
import { AsignUsersRolesInput }     from '@user-roles/dto/asign-users-roles.input';
import { UserRole }                 from '@user-roles/entities/user-role.entity';
import { AssignUsersRolesResponse } from '@user-roles/entities/user-role-data.entity';
import { User }                     from '@user/entities/user.entity';


@Injectable()
export class UserRolesService implements OnModuleInit {

    constructor(
        @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient
    ) {}


    onModuleInit() {
        this.prisma.$connect();
    }


    async assignRoleToUser(
        roleId: string,
        userId: string,
        currentUser: User
    ): Promise<UserRole> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select : { apiUserId: true, id: true }
        });

        if ( !user ) throw new NotFoundException( `User whit id ${userId} not found.` );
        if ( user.apiUserId !== currentUser.id && user.id !== currentUser.id )
            throw new ForbiddenException( 'You are not allowed to assign a role to this user.' );

        try {
            return await this.prisma.userRole.create({
                data: {
                    userId,
                    roleId
                },
                include: {
                    role: true,
                    user: true
                }
            }) as UserRole;
        } catch (error) {
            throw PrismaException.catch( error, 'Role' );
        }
    }


    async asignManyRolesToUsers(
        currentUser             : User,
        { userIds, roleIds }    : AsignUsersRolesInput,
    ): Promise<AssignUsersRolesResponse> {
        const users = await this.prisma.user.findMany({
            where  : { id: { in: userIds }, apiUserId: currentUser.id },
            select : { id: true }
        });
    
        const validUserIds = users.map(user => user.id);
    
        const roles = await this.prisma.role.findMany({
            where  : { id: { in: roleIds }, userId: currentUser.id },
            select : { id: true }
        });
        const validRoleIds = roles.map(role => role.id);
    
        const invalidUsers = userIds.filter(id => !validUserIds.includes(id));
        const invalidRoles = roleIds.filter(id => !validRoleIds.includes(id));
    
        const roleAssignments = validUserIds.flatMap(userId =>
            validRoleIds.map(roleId => ({ userId, roleId }))
        );

        try {
            await this.prisma.userRole.createMany({ data: roleAssignments, skipDuplicates: true });
    
            const createdAssignments = await this.prisma.userRole.findMany({
                where  : { OR: roleAssignments },
                include: { user: true, role: true }
            });
        
            return {
                success: createdAssignments,
                errors: [
                    ...invalidUsers.map(id => ({ userId: id, error: 'User not found or unauthorized' })),
                    ...invalidRoles.map(id => ({ roleId: id, error: 'Role not found or unauthorized' }))
                ]
            } as AssignUsersRolesResponse;
            
        } catch (error) {
            throw PrismaException.catch( error );
        }
    }


    async remove( id: string, currentUser: User ): Promise<UserRole> {
        const roleUser = await this.prisma.userRole.findUnique({
            where   : { id },
            select  : { user: true }
        });

        if ( !roleUser ) throw new NotFoundException( 'RoleUser not found' );
        if ( roleUser.user.id !== currentUser.id ) throw new ForbiddenException( "Don't have permission" );

        try {
            return await this.prisma.userRole.delete({
                where   : { id },
                select  : { id: true, user: true, role: true }
            }) as UserRole;
        } catch ( error ) {
            throw PrismaException.catch( error, 'RoleUser' );
        }
    }


    async removeManyByIds(
        currentUser : User,
        ids         : string[]
    ): Promise<AssignUsersRolesResponse> {
        const roleUsers = await this.prisma.userRole.findMany({
            where   : { id: { in: ids } },
            select  : { id: true, user: true, roleId: true, userId: true, role: true }
        });

        const validRoleUsers   = roleUsers.filter(roleUser => roleUser.user.apiUserId === currentUser.id);
        const invalidRoleUsers = ids.filter(id => !validRoleUsers.some(roleUser => roleUser.id === id));

        if ( validRoleUsers.length > 0 ) {
            await this.prisma.userRole.deleteMany({
                where: { id: { in: validRoleUsers.map(r => r.id) } }
            });
        }

        return {
            success: validRoleUsers.map(({ id, user, role }) => ({
                id,
                user,
                role
            })),
            errors: invalidRoleUsers.map(id => ({
                error: "Not found or unauthorized",
                userId: id,
                roleId: ''
            }))
        } as AssignUsersRolesResponse;
    }

}
