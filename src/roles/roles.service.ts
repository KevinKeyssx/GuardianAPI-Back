import { PrismaException } from '@config/prisma-catch';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import { PrismaClient, Role, UserRole } from '@prisma/client';

import { CreateRoleInput }  from '@roles/dto/create-role.input';
import { UpdateRoleInput }  from '@roles/dto/update-role.input';
import { User }             from '@user/entities/user.entity';


@Injectable()
export class RolesService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
        this.$connect();
    }


    async #validName( name: string, currentUser: User ): Promise<void> {
        const role = await this.role.findUnique({
            where: {
                name,
                userId: currentUser.id
            }
        });

        if ( role ) throw new BadRequestException( 'Role already exists' );
    }

    // TODO: HAY QUE ASIGNAR UN ROLE CUANDO SE CREA UN USUARIO NORMAL
    async create(
        currentUser     : User,
        createRoleInput : CreateRoleInput
    ): Promise<Role> {
        await this.#validName( createRoleInput.name, currentUser );

        return this.role.create({
            data: {
                ...createRoleInput,
                userId: currentUser.id
            }
        });
    }


    async assignRoleToUser(
        roleId: string,
        userId: string,
        currentUser: User
    ): Promise<UserRole> {
        await this.findOne( roleId, currentUser );

        const user = await this.user.findUnique({ where: { id: userId }});

        if ( !user ) throw new NotFoundException( `User whit id ${userId} not found.` );
        if ( user.apiUserId !== currentUser.id ) throw new ForbiddenException( 'You are not allowed to assign a role to this user.' );

        try {
            return await this.userRole.create({
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
            throw PrismaException.catch( error );
        }
    }


    async findAll( currentUser: User ): Promise<Role[]> {
        // TODO: Add pagination, by UserId, 
        return this.role.findMany({
            where: {
                userId: currentUser.id
            }
        });
    }


    async findOne( id: string, currentUser: User ) {
        // TODO: Add pagination, by UserId, 
        const role = await this.role.findUnique({
            where: {
                id,
                userId: currentUser.id
            }
        });

        if ( !role ) throw new NotFoundException( `Role whit id ${id} not found` );
        if ( role.userId !== currentUser.id ) throw new ForbiddenException( 'You are not allowed to access this role.' );

        return role;
    }


    // TODO: HAY UN BUG Cuando actualizo un name, pero ya existe para otro usuario
    // TODO: Esto no debería pasar ya que el name debe ser único por usuario id
    async update(
        updateRoleInput: UpdateRoleInput,
        currentUser: User
    ): Promise<Role> {
        await this.findOne( updateRoleInput.id, currentUser );

        if ( updateRoleInput.name ) await this.#validName( updateRoleInput.name, currentUser );

        return this.role.update({
            where: {
                id: updateRoleInput.id,
                userId: currentUser.id
            },
            data: updateRoleInput
        });
    }


    async remove( id: string, currentUser: User ): Promise<Role> {
        await this.findOne( id, currentUser );

        return this.role.delete({
            where: {
                id
            }
        });
    }

}
