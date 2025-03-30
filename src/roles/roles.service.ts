import {
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import { PrismaClient, Role } from '@prisma/client';

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
        const role = await this.findOne( updateRoleInput.id, currentUser );

        try {
            return await this.prisma.role.update({
                where: {
                    id      : updateRoleInput.id,
                    userId  : currentUser.id,
                    version : role.version
                },
                data: {
                    ...updateRoleInput,
                    version: role.version + 1
                }
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
        try {
            return this.prisma.role.delete({ where: { id, userId: currentUser.id }});
        }
        catch (error) {
            throw PrismaException.catch( error, 'Role' );
        }
    }

}
