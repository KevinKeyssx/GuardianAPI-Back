import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { PrismaClient, PwdAdmin } from '@prisma/client';

import { CreatePwdAdminInput } from '@pwd-admin/dto/create-pwd-admin.input';
import { UpdatePwdAdminInput } from '@pwd-admin/dto/update-pwd-admin.input';


@Injectable()
export class PwdAdminService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
        this.$connect();
    }


    async update(
        updatePwdAdminInput: UpdatePwdAdminInput
    ): Promise<PwdAdmin> {
        /** TODO: Hay que agregar al usuario para buscar como usuario o correo y
        * ? Obtener el id del usuario y modificar por id de usuario y modificar solo la pdw activa
        */

        const pwd = await this.pwdAdmin.findUnique({
            where: {
                id          : updatePwdAdminInput.id,
                isActive    : true
            }
        });

        // TODO: Validar que no cambie el iddel usuario

        if ( !pwd ) throw new NotFoundException( `Pwd whit id ${updatePwdAdminInput.id} not found.` );

        return this.pwdAdmin.update({
            where: {
                id: updatePwdAdminInput.id
            },
            data: updatePwdAdminInput
        });
    }

}
