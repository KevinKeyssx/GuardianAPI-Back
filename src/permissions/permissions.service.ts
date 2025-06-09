import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { Permission, PrismaClient } from '@prisma/client';

import { PrismaException }          from '@config/prisma-catch';
import { PaginationArgs }           from '@common/dto/args/pagination.args';
import { SearchArgs }               from '@common/dto/args/search.args';
import { CreatePermissionInput }    from '@permissions/dto/create-permission.input';
import { UpdatePermissionInput }    from '@permissions/dto/update-permission.input';
import { User }                     from '@user/entities/user.entity';


@Injectable()
export class PermissionsService implements OnModuleInit {

    constructor(
        @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient
    ) {}


    onModuleInit() {
        this.prisma.$connect();
    }


    async create(
        currentUser     : User,
        createPermissionInput : CreatePermissionInput
    ): Promise<Permission> {
        try {
            const userCount = await this.prisma.user.count({ where: { apiUserId: currentUser.apiUserId }});

            if ( userCount >= currentUser.plan!.maxRoles )
                throw new BadRequestException( 'Maximum roles reached.' );


            return await this.prisma.permission.create({
                data: {
                    ...createPermissionInput,
                    userId: currentUser.id
                }
            });

            
        } catch (error) {
            throw PrismaException.catch( error, 'Permission' );
        }
    }

    async findAll(
        currentUser             : User,
        { page, each, orderBy } : PaginationArgs,
        { search }              : SearchArgs,
    ) {
        return this.prisma.permission.findMany({
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


    async findOne(
        id          : string,
        currentUser : User
    ): Promise<Permission> {
        const permission = await this.prisma.permission.findUnique({
            where: {
                id,
                userId: currentUser.id
            }
        });

        if ( !permission ) throw new NotFoundException( `Permission whit id ${id} not found` );

        return permission;
    }


    async update(
        updatePermissionInput : UpdatePermissionInput,
        currentUser           : User
    ): Promise<Permission> {
        const permission = await this.findOne( updatePermissionInput.id, currentUser );

        try {
            return await this.prisma.permission.update({
                where: {
                    id      : updatePermissionInput.id,
                    userId  : currentUser.id,
                    version : permission.version
                },
                data: {
                    ...updatePermissionInput,
                    version: permission.version + 1
                }
            });
        }
        catch ( error ) {
            throw PrismaException.catch( error, 'Permission' );
        }
    }


    async remove(
        id          : string,
        currentUser : User
    ): Promise<Permission> {
        try {
            return await this.prisma.permission.delete({
                where: {
                    id,
                    userId: currentUser.id
                }
            });
        }
        catch ( error ) {
            throw PrismaException.catch( error, 'Permission' );
        }
    }
}
