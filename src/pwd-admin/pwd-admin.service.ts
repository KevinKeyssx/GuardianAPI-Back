import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    OnModuleInit
}                               from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaClient, PwdAdmin }   from '@prisma/client';
import * as bcrypt                  from 'bcryptjs';

import { UpdatePwdAdminInput }  from '@pwd-admin/dto/update-pwd-admin.input';
import { UpdatePwdInput }       from '@pwd-admin/dto/update-pwd.input';
import { User }                 from '@user/entities/user.entity';


@Injectable()
export class PwdAdminService implements OnModuleInit {

    constructor(
        @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient
    ) {}

    onModuleInit() {
        this.prisma.$connect();
    }

    async activeGuardian(
        currentUser         : User,
        updatePwdAdminInput : UpdatePwdAdminInput
    ): Promise<PwdAdmin> {
        const pwd = await this.prisma.pwdAdmin.findFirst({
            select: {
                id          : true,
                user        : { select: { id: true }},
                isGuardian  : true,
                version     : true
            },
            where: {
                userId  : currentUser.id,
                isActive: true
            }
        });

        if ( !pwd )                             throw new NotFoundException( `Guardian not found.` );
        if ( pwd.user.id !== currentUser.id )   throw new ForbiddenException( 'You are not authorized to update this Pwd' );

        const willExpires = new Date();

        willExpires.setDate( willExpires.getDate() + updatePwdAdminInput.howOften );

        const updatedPwd = await this.prisma.pwdAdmin.update({
            where: { id: pwd.id, version: pwd.version },
            data: {
                ...updatePwdAdminInput,
                willExpireAt    : willExpires,
                isGuardian      : true,
                version         : pwd.version + 1
            }
        });

        if ( !updatedPwd ) throw new ConflictException( 'The registry was modified by another user recently' );

        return updatedPwd;
    }


    async changePassword(
        currentUser: User,
        {
            currentPassword,
            newPassword
        }: UpdatePwdInput
    ) {
        if ( currentPassword === newPassword )
            throw new BadRequestException( 'Current password and new password are the same' );

        const pwds = await this.prisma.pwdAdmin.findMany({
            select  : {
                id          : true,
                password    : true,
                updatedAt   : true,
                isActive    : true,
                howOften    : true,
                alertDay    : true,
                isGuardian  : true,
                userId      : true,
                version     : true
            },
            take    : 5,
            where   : { userId: currentUser.id },
            orderBy : { updatedAt: 'asc' }
        });

        const lastActivePwd = pwds.find(({ isActive }) => isActive );

        if ( !lastActivePwd ) throw new InternalServerErrorException( `Can't find active password.` );

        if ( lastActivePwd.userId !== currentUser.id )
            throw new ForbiddenException( 'You are not authorized to update this password' );

        if ( !bcrypt.compareSync( currentPassword, lastActivePwd.password ))
            throw new BadRequestException( 'Invalid credentials.' );

        if ( pwds.length > 0 && lastActivePwd.isGuardian ) {
            if (pwds.some(({ password: pwd }) => bcrypt.compareSync(newPassword, pwd))) {
                throw new BadRequestException('The new password cannot be the same as any of the last 5');
            }
        }

        return await this.prisma.$transaction(async (prisma) => {
            await prisma.pwdAdmin.update({
                data: {
                    isActive  : false,
                    expiresAt : new Date(),
                    version   : lastActivePwd.version + 1
                },
                where: {
                    id      : lastActivePwd.id,
                    version : lastActivePwd.version
                },
            });

            if ( pwds.length === 5 ) await prisma.pwdAdmin.delete({ where: { id: pwds[0].id }});

            const willExpires = lastActivePwd.isGuardian
                ? new Date( new Date().setDate( new Date().getDate() + lastActivePwd.howOften! ))
                : null;

            return prisma.pwdAdmin.create({
                data: {
                    user            : { connect: { id: currentUser.id } },
                    password        : bcrypt.hashSync(newPassword, 10),
                    howOften        : lastActivePwd.howOften,
                    alertDay        : lastActivePwd.alertDay,
                    willExpireAt    : willExpires,
                    isGuardian      : lastActivePwd.isGuardian,
                },
            });
        });
    }


    @Cron( CronExpression.EVERY_DAY_AT_MIDNIGHT )
    async disableExpiredPasswords() {
        const now = new Date();

        await this.prisma.pwdAdmin.updateMany({
            where: {
                isActive        : true,
                isGuardian      : true,
                willExpireAt    : { lt: now },
            },
            data: {
                isActive    : false,
                expiresAt   : now
            }
        });
    }

}
