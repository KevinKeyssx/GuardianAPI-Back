import {
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit,
    UnauthorizedException
}                               from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { randomBytes, createHmac }      from 'crypto';
import { Prisma, PrismaClient, Secret } from '@prisma/client';

import { ENVS }                     from '@config/envs';
import { PrismaException }          from '@config/prisma-catch';
import { CreateSecretInput }        from '@secrets/dto/create-secret.input';
import { GenerateSecretResponse }   from '@secrets/entities/secret-response.entity';
import { SecretEntity }             from '@secrets/entities/secret.entity';
import { UpdateSecretInput }        from '@secrets/dto/update-secret.input';
import { User }                     from '@user/entities/user.entity';


@Injectable()
export class SecretsService implements OnModuleInit {

    constructor(
        @Inject( 'PRISMA_CLIENT' ) private readonly prisma: PrismaClient
    ) {}


    onModuleInit() {
		this.prisma.$connect();
	}


    #generateSecret = () => randomBytes( 32 ).toString( 'hex' );


    #createHmac = (
        salt    : string,
        secret  : string,
        hash    : string = 'sha512'
    ): string => createHmac( hash, salt )
        .update( secret )
        .digest( 'hex' );


    #deriveSalt = ( userId: string ): string => this.#createHmac( ENVS.SECRET_SALT, userId );


    #generateSecretHash = (
        userId: string,
        secret: string
    ): string => {
        const salt = this.#deriveSalt( userId );
        return this.#createHmac( salt, secret );
    };


    validateSecret = async (
        userId          : string,
        providedSecret  : string
    ): Promise<boolean> => {
        const userSecret = await this.prisma.secret.findFirst({
            where: {  
                apiUserId: userId,
                isActive: true,
            },
        });

        if ( !userSecret ) throw new UnauthorizedException( `Can't found a active secret for user ${userId}` );

        const salt = this.#deriveSalt( userId );

        return this.#createHmac( salt, providedSecret ) === userSecret.secret;
    };


    async create(
        currentUser         : User,
        createSecretInput   : CreateSecretInput
    ): Promise<GenerateSecretResponse> {
        try {
            await this.prisma.secret.deleteMany({
                where: {
                    apiUserId: currentUser.id,
                }
            });

            const secret        = this.#generateSecret();
            const secretHash    = this.#generateSecretHash(currentUser.id, secret);
            const createdSecret = await this.prisma.secret.create({
                data: {
                    willExpireAt   : createSecretInput.willExpireAt,
                    apiUserId      : currentUser.id,
                    secret         : secretHash,
                }
            });

            const secretData: SecretEntity = {
                ...createdSecret,
                willExpireAt    : createdSecret.willExpireAt ?? undefined,
                expiresAt       : createdSecret.expiresAt ?? undefined,
            };

            return {
                secret,
                secretData
            };

        } catch ( error ) {
            throw PrismaException.catch( error, 'Secret' );
        }
    }


    async updateExpiresAt(
        currentUser     : User,
        { willExpireAt }   : UpdateSecretInput
    ): Promise<Secret> {
        try {
            const secret = await this.prisma.secret.findFirst({
                select: {
                    id: true,
                    version: true
                },
                where: {
                    apiUserId   : currentUser.id,
                    isActive    : true
                }
            });

            if ( !secret ) throw new NotFoundException( `Secret whit id ${currentUser.id} not found.` );

            return await this.prisma.secret.update({
                where   : {
                    id          : secret.id,
                    isActive    : true,
                    apiUserId   : currentUser.id,
                    version     : secret.version
                },
                data    : {
                    willExpireAt,
                    version: secret.version + 1
                }
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Secret' );
        }
    }


    async findOne( currentUser: User ): Promise<SecretEntity> {
        const secret = await this.prisma.secret.findFirst({
            select: {
                id              : true,
                willExpireAt    : true,
                expiresAt       : true,
                isActive        : true,
                createdAt       : true,
                updatedAt       : true,
            },
            where: {
                apiUserId   : currentUser.id,
                isActive    : true
            }
        });

        if ( !secret ) throw new NotFoundException( `Secret whit id ${currentUser.id} not found.` );

        return secret as SecretEntity;
    }


    async remove( currentUser: User ): Promise<Prisma.BatchPayload> {
        try {
            return await this.prisma.secret.deleteMany({
                where: {
                    apiUserId: currentUser.id
                }
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Secret' );
        }
    }


    @Cron( CronExpression.EVERY_DAY_AT_MIDNIGHT )
    async disableExpiredPasswords() {
        const now = new Date();

        await this.prisma.secret.updateMany({
            where: {
                isActive        : true,
                willExpireAt    : { lt: now },
            },
            data: {
                isActive    : false,
                expiresAt   : now
            }
        });
    }
}
