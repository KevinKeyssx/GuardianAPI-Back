import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit,
    UnauthorizedException
}                               from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { randomBytes, createHmac }  from 'crypto';
import { PrismaClient, Secret }     from '@prisma/client';

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
        const userSecrets = await this.prisma.secret.findMany({
            select: {
                secret: true
            },
            where: {  
                apiUserId: userId,
                isActive: true,
            },
        });

        if ( userSecrets.length === 0 ) throw new UnauthorizedException( `Can't found a active secret for user ${userId}` );

        const salt = this.#deriveSalt( userId );

        return userSecrets.some( secret => this.#createHmac( salt, providedSecret ) === secret.secret );
    };


    async create(
        currentUser         : User,
        createSecretInput   : CreateSecretInput
    ): Promise<GenerateSecretResponse> {
        try {
            const secretCount = await this.prisma.secret.count({ where: { apiUserId: currentUser.id }});

            if ( secretCount >= 8 ) throw new BadRequestException( 'You can only have 8 secrets.' );

            const secret        = this.#generateSecret();
            const secretHash    = this.#generateSecretHash( currentUser.id, secret );
            const createdSecret = await this.prisma.secret.create({
                data: {
                    ...createSecretInput,
                    apiUserId      : currentUser.id,
                    secret         : secretHash,
                }
            });

            const secretData: SecretEntity = {
                ...createdSecret,
                willExpireAt    : createdSecret.willExpireAt    ?? undefined,
                expiresAt       : createdSecret.expiresAt       ?? undefined,
            }

            return {
                secret,
                secretData
            }
        } catch ( error ) {
            throw PrismaException.catch( error, 'Secret' );
        }
    }


    async updateExpiresAt(
        currentUser         : User,
        { id, name, willExpireAt }: UpdateSecretInput
    ): Promise<Secret> {
        try {
            const secret = await this.prisma.secret.findUnique({
                select: {
                    id      : true,
                    version : true
                },
                where: {
                    id          : id,
                    isActive    : true
                }
            });

            if ( !secret ) throw new NotFoundException( `Secret whit id ${id} not found.` );

            return await this.prisma.secret.update({
                where   : {
                    id          : secret.id,
                    isActive    : true,
                    apiUserId   : currentUser.id,
                    version     : secret.version
                },
                data    : {
                    willExpireAt,
                    name,
                    version: secret.version + 1
                }
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Secret' );
        }
    }


    async findAll( currentUser: User ): Promise<SecretEntity[]> {
        const secrets = await this.prisma.secret.findMany({
            select: {
                id              : true,
                name            : true,
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

        return secrets as SecretEntity[];
    }


    async remove( currentUser: User, id: string ): Promise<boolean> {
        try {
            return await this.prisma.secret.delete({
                where: {
                    apiUserId: currentUser.id,
                    id
                }
            }) !== null;
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
