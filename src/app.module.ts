import { join } from 'path';

import { Module }                           from '@nestjs/common';
import { GraphQLModule }                    from '@nestjs/graphql';
import { JwtService }                       from '@nestjs/jwt';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ScheduleModule }                   from '@nestjs/schedule';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';


import { AppController }                from './app.controller';
import { AuthModule }                   from '@auth/auth.module';
import { CommonModule }                 from '@common/common.module';
import { UserModule }                   from '@user/user.module';
import { RolesModule }                  from '@roles/roles.module';
import { UserAttributeModule }          from '@user-attribute/user-attribute.module';
import { SecretsModule }                from '@secrets/secrets.module';
import { PwdAdminModule }               from '@pwd-admin/pwd-admin.module';
import { PrismaModule }                 from '@prisma/prisma.module';
import { UserRolesModule }              from '@user-roles/user-roles.module';
import { UserAttributeValuesModule }    from '@user-attribute-values/user-attribute-values.module';


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
                context: ({ req }) => {
                    try {
                        let token = req.cookies?.token;

                        if ( !token ) {
                            token = req.headers.authorization?.split(' ')[1];
                            if ( !token ) throw new Error( 'Token needed' );
                        }

                        const payload = jwtService.decode(token); // Usa verify en lugar de decode para validar
                        // const payload = jwtService.verify(token); // Usa verify en lugar de decode para validar
                        if ( !payload ) throw new Error( 'Invalid token' );

                        return { user: payload };
                    } catch (error) {
                        console.error('Error in GraphQL context:', error.message);
                        throw error;
                    }
                },
            }),
        }),

        ScheduleModule.forRoot(),

        UserModule,
        AuthModule,
        RolesModule,
        UserAttributeModule,
        PwdAdminModule,
        SecretsModule,
        PrismaModule,
        CommonModule,
        UserRolesModule,
        UserAttributeValuesModule,
    ],
    controllers : [ AppController ],
    providers   : [],
})
export class AppModule {}
