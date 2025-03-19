import { Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';

import { randomBytes, createHmac }      from 'crypto';
import { Prisma, PrismaClient, Secret } from '@prisma/client';

import { CreateSecretInput }        from '@secrets/dto/create-secret.input';
import { GenerateSecretResponse }   from '@secrets/entities/secret-response.entity';
import { SecretEntity }             from '@secrets/entities/secret.entity';
import { User }                     from '@user/entities/user.entity';
import { ENVS }                     from '@config/envs';


@Injectable()
export class SecretsService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
		this.$connect();
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
        const userSecret = await this.secret.findFirst({
            where: {  
                apiUserId: userId,
                isActive: true,
            },
        });

        if ( !userSecret ) throw new UnauthorizedException( `Invalid secretddddd.` );

        const salt = this.#deriveSalt( userId );

        return this.#createHmac( salt, providedSecret ) === userSecret.secret;
    };


    async create(
        currentUser         : User,
        createSecretInput   : CreateSecretInput
    ): Promise<GenerateSecretResponse> {
        await this.secret.deleteMany({
            where: {
                apiUserId: currentUser.id,
            }
        });

        const secret        = this.#generateSecret();
        const secretHash    = this.#generateSecretHash(currentUser.id, secret);
        const createdSecret = await this.secret.create({
            data: {
                expiresAt   : createSecretInput.expiresAt,
                apiUserId   : currentUser.id,
                secret      : secretHash,
            }
        });

        const secretData: SecretEntity = {
            ...createdSecret,
            expiresAt: createdSecret.expiresAt ?? undefined,
        };

        return {
            secret,
            secretData
        };
    }


    async findOne( currentUser: User ): Promise<Secret> {
        const secret = await this.secret.findFirst({
            where: {
                apiUserId: currentUser.id
            }
        });

        if ( !secret ) throw new NotFoundException( `Secret whit id ${currentUser.id} not found.` );

        return secret;
    }


    async remove( currentUser: User ): Promise<Prisma.BatchPayload> {
        try {
            return await this.secret.deleteMany({
                where: {
                    apiUserId: currentUser.id
                }
            });
        } catch (error) {
            throw new NotFoundException( `Secret to user ${currentUser.id} not found.` );
        }
    }
}
