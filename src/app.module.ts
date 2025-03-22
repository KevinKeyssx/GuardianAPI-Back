import { join } from 'path';

import { Module }                           from '@nestjs/common';
import { GraphQLModule }                    from '@nestjs/graphql';
import { JwtService }                       from '@nestjs/jwt';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { AppController }        from './app.controller';
import { AuthModule }           from '@auth/auth.module';
import { UserModule }           from '@user/user.module';
import { RolesModule }          from '@roles/roles.module';
import { UserAttributeModule }  from '@user-attribute/user-attribute.module';
import { SecretsModule }        from '@secrets/secrets.module';
import { PwdAdminModule }       from '@pwd-admin/pwd-admin.module';
import { PrismaModule }         from '@prisma/prisma.module';


@Module({
    imports     : [
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver      : ApolloDriver,
            imports     : [ AuthModule ],
            inject      : [ JwtService ],
            useFactory  : async( jwtService: JwtService ) => ({
                playground      : false,
                autoSchemaFile  : join( process.cwd(), 'src/schema.gql' ),
                plugins         : [ ApolloServerPluginLandingPageLocalDefault() ],
                context ({ req }) { 
                    const token = req.headers.authorization?.split(' ')[1];
                    if ( !token ) throw new Error( 'Token needed' );

                    const payload = jwtService.decode( token );
                    if ( !payload ) throw new Error( 'Invalid token' );
                },
            }),
        }),

        // GraphQLModule.forRoot<ApolloDriverConfig>({
        //     driver          : ApolloDriver,
        //     playground      : false,
        //     autoSchemaFile  : join( process.cwd(), 'src/schema.gql' ),
        //     plugins         : [ ApolloServerPluginLandingPageLocalDefault() ],
        // }),
        UserModule,
        AuthModule,
        RolesModule,
        UserAttributeModule,
        PwdAdminModule,
        SecretsModule,
        PrismaModule,
    ],
    controllers : [ AppController ],
    providers   : [],
})
export class AppModule {}
