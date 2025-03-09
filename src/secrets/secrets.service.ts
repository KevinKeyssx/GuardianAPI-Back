import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { randomBytes, createHmac }  from 'crypto';
import { PrismaClient, Secret }     from '@prisma/client';

import { CreateSecretInput }        from '@secrets/dto/create-secret.input';
import { UpdateSecretInput }        from '@secrets/dto/update-secret.input';
import { GenerateSecretResponse }   from '@secrets/entities/secret-response.entity';
import { SecretEntity }             from '@secrets/entities/secret.entity';
import { ENVS }                     from '../config/envs';


@Injectable()
export class SecretsService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
		this.$connect();
	}


    #generateSecret = () => randomBytes( 32 ).toString( 'hex' );


    #deriveSalt = ( userId: string ): string => 
        createHmac( 'sha512', ENVS.SECRET_SALT )
            .update( userId )
            .digest( 'hex' );


    #generateSecretHash = (
        userId: string,
        secret: string
    ): string => {
        const salt = this.#deriveSalt( userId );
        return createHmac( 'sha512', salt )
            .update( secret )
            .digest( 'hex' );
    };


    #validateSecret = async (
        userId          : string,
        providedSecret  : string
    ): Promise<boolean> => {
        const userSecret = await this.secret.findFirst({
            where: {  
                apiUserId: userId,
                isActive: true,
            },
        });

        if ( !userSecret ) throw new NotFoundException( `Secret whit id ${userId} not found.` );

        const salt                  = this.#deriveSalt( userId );
        const hashedProvidedSecret  = createHmac( 'sha512', salt ).update( providedSecret ).digest( 'hex' );

        return hashedProvidedSecret === userSecret.secret;
    };


    // TODO: CREAR UN PIPE CUSTOM
    // QUE SE ENCARGUE VALIDAR QUE EL USUARIO ES HIJO DE UNA CUENTA API
    // Y QUE VALIDE EL SECRET

    async create(
        createSecretInput: CreateSecretInput
    ): Promise<GenerateSecretResponse> {
        // const secrets = await this.secret.findMany({
        //     where: {
        //         apiUserId: createSecretInput.userId,
        //     }
        // });

        // if ( secrets.length > 0 ) {
        //     const secret = secrets.find( secret => secret.isActive );

        //     await this.secret.update({
        //         where: {
        //             id: secret!.id
        //         },
        //         data: {
        //             isActive: false
        //         }
        //     });
        // }

        await this.secret.deleteMany({
            where: {
                apiUserId: createSecretInput.userId,
            }
        });

        const secret        = this.#generateSecret();
        const secretHash    = this.#generateSecretHash(createSecretInput.userId, secret);
        const createdSecret = await this.secret.create({
            data: {
                expiresAt   : createSecretInput.expiresAt,
                apiUserId   : createSecretInput.userId,
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


    async findOne( userId: string ): Promise<Secret> {
        const secret = await this.secret.findFirst({
            where: {
                apiUserId: userId
            }
        });

        if ( !secret ) throw new NotFoundException( `Secret whit id ${userId} not found.` );

        return secret;
    }


    async update(
        updateSecretInput: UpdateSecretInput
    ): Promise<Secret> {
        const secret = await this.secret.findUnique({
            where: {
                id: updateSecretInput.id
            }
        });

        if ( !secret ) throw new NotFoundException( `Secret whit id ${updateSecretInput.id} not found.` );

        return this.secret.update({
            where: {
                id: updateSecretInput.id
            },
            data: {
                expiresAt: updateSecretInput.expiresAt,
            }
        });
    }


    async remove( id: string ): Promise<Secret> {
        const secret = await this.secret.findUnique({
            where: {
                id
            }
        });

        if ( !secret ) throw new NotFoundException( `Secret whit id ${id} not found.` );

        return this.secret.delete({
            where: {
                id
            }
        });
    }
}
