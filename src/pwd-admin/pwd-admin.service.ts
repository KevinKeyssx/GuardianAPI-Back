import { PrismaException } from '@config/prisma-catch';
import { ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { PrismaClient, PwdAdmin } from '@prisma/client';

import { CreatePwdAdminInput }  from '@pwd-admin/dto/create-pwd-admin.input';
import { UpdatePwdAdminInput }  from '@pwd-admin/dto/update-pwd-admin.input';
import { User }                 from '@user/entities/user.entity';


@Injectable()
export class PwdAdminService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
        this.$connect();
    }


    async update(
        currentUser         : User,
        updatePwdAdminInput : UpdatePwdAdminInput
    ): Promise<PwdAdmin> {
        try {
            const pwd = await this.pwdAdmin.findUnique({
                where: {
                    id          : updatePwdAdminInput.id,
                    isActive    : true
                },
                select: { id: true, user: { select: { id: true }}},
            });

            if ( !pwd ) throw new NotFoundException( `Pwd whit id ${updatePwdAdminInput.id} not found.` );
            if ( pwd.user.id !== currentUser.id  ) {
                throw new ForbiddenException( 'You are not authorized to update this Pwd' );
            }

            return this.pwdAdmin.update({
                where: {
                    id: updatePwdAdminInput.id
                },
                data: updatePwdAdminInput
            });


            // const updatedPwd = await this.pwdAdmin.update({
            //     where: { id: updatePwdAdminInput.id, version: pwd.version },
            //     data: {
            //       password: updatePwdAdminInput.password,
            //       alertDay: updatePwdAdminInput.alertDay,
            //       howOften: updatePwdAdminInput.howOften,
            //       changeLastAt: updatePwdAdminInput.changeLastAt,
            //       expiresAt: updatePwdAdminInput.expiresAt,
            //       mustChange: updatePwdAdminInput.mustChange,
            //       version: pwd.version + 1, // Incrementa la versión
            //     },
            //   });
            
            //   if (!updatedPwd) {
            //     throw new ConflictException('El registro ha sido actualizado por otro usuario');
            //   }
        } catch (error) {
            throw PrismaException.catch( error, 'PwdAdmin' );
        }
    }


    async updatePassword(
        currentUser         : User,
        updatePwdAdminInput : UpdatePwdAdminInput
    ) {}

}
