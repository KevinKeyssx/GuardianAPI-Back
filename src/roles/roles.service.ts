import {
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import { PrismaClient, Role, UserRole } from '@prisma/client';

import { PrismaException }  from '@config/prisma-catch';
import { PaginationArgs }   from '@common/dto/args/pagination.args';
import { SearchArgs }       from '@common/dto/args/search.args';
import { CreateRoleInput }  from '@roles/dto/create-role.input';
import { UpdateRoleInput }  from '@roles/dto/update-role.input';
import { User }             from '@user/entities/user.entity';


@Injectable()
export class RolesService implements OnModuleInit {

    constructor(
        @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient
    ) {}

    onModuleInit() {
        this.prisma.$connect();
    }


    async create(
        currentUser     : User,
        createRoleInput : CreateRoleInput
    ): Promise<Role> {
        try {
            return await this.prisma.role.create({
                data: {
                    ...createRoleInput,
                    userId: currentUser.id
                }
            });
        } catch (error) {
            throw PrismaException.catch( error, 'Role' );
        }
    }


    async assignRoleToUser(
        roleId: string,
        userId: string,
        currentUser: User
    ): Promise<UserRole> {
        const user = await this.prisma.user.findUnique({ where: { id: userId }});

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
            });
        } catch (error) {
            throw PrismaException.catch( error, 'Role' );
        }
    }


    async findAll(
        currentUser             : User,
        { page, each, orderBy } : PaginationArgs,
        { search }              : SearchArgs,
    ): Promise<Role[]> {
        return this.prisma.role.findMany({
            take    : each,
            skip    : page,
            orderBy : { name: orderBy },
            where   : {
                userId  : currentUser.id,
                name    : {
                    contains    : search,
                    mode        : 'insensitive',
                }
            },
        });
    }


    async findOne( id: string, currentUser: User ): Promise<Role> {
        const role = await this.prisma.role.findUnique({
            where: {
                id,
                userId: currentUser.id
            }
        });

        if ( !role ) throw new NotFoundException( `Role whit id ${id} not found` );

        return role;
    }


    async update(
        updateRoleInput : UpdateRoleInput,
        currentUser     : User
    ): Promise<Role> {
        await this.findOne( updateRoleInput.id, currentUser );

        try {
            return await this.prisma.role.update({
                where: {
                    id      : updateRoleInput.id,
                    userId  : currentUser.id
                },
                data: updateRoleInput
            });
        }
        catch ( error ) {
            throw PrismaException.catch( error, 'Role' );
        }
    }


    async remove(
        id          : string,
        currentUser : User
    ): Promise<Role> {
        await this.findOne( id, currentUser );

        try {
            return this.prisma.role.delete({ where: { id }});
        }
        catch (error) {
            throw PrismaException.catch( error, 'Role' );
        }
    }

}
