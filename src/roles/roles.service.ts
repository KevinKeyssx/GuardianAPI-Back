import {
    BadRequestException,
    Injectable,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import { PrismaClient, Role, UserRole } from '@prisma/client';

import { CreateRoleInput } from '@roles/dto/create-role.input';
import { UpdateRoleInput } from '@roles/dto/update-role.input';


@Injectable()
export class RolesService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
        this.$connect();
    }


    async #validName( name: string ): Promise<void> {
        const role = await this.role.findUnique({
            where: {
                name
            }
        });

        if ( role ) throw new BadRequestException( 'Role already exists' );
    }


    async create( createRoleInput: CreateRoleInput ): Promise<Role> {
        await this.#validName( createRoleInput.name );

        return this.role.create({
            data: createRoleInput
        });
    }


    async assignRoleToUser(
        roleId: string,
        userId: string
    ): Promise<UserRole> {
        await this.findOne( roleId );
        // TODO: Validate user

        return this.userRole.create({
            data: {
                userId,
                roleId
            }
        });
    }


    async findAll(): Promise<Role[]> {
        // TODO: Add pagination, by UserId, 
        return this.role.findMany();
    }


    async findOne( id: string ) {
        // TODO: Add pagination, by UserId, 
        const role = await this.role.findUnique({
            where: {
                id
            }
        });

        if ( !role ) throw new NotFoundException( `Role whit id ${id} not found` );

        return role;
    }


    async update( updateRoleInput: UpdateRoleInput ): Promise<Role> {
        if ( updateRoleInput.name ) {
            await this.#validName( updateRoleInput.name );
        }

        return this.role.update({
            where: {
                id: updateRoleInput.id
            },
            data: updateRoleInput
        });
    }


    async remove( id: string ): Promise<Role> {
        await this.findOne( id );

        return this.role.delete({
            where: {
                id
            }
        });
    }

}
