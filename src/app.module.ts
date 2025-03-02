import { join } from 'path';

import { Module }                           from '@nestjs/common';
import { GraphQLModule }                    from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { AppController }        from './app.controller';
import { AuthModule }           from '@auth/auth.module';
import { UserModule }           from '@user/user.module';
import { RolesModule }          from '@roles/roles.module';
import { UserAttributeModule }  from '@user-attribute/user-attribute.module';
import { SecretsModule }        from '@secrets/secrets.module';
import { PwdAdminModule }       from '@pwd-admin/pwd-admin.module';


@Module({
    imports     : [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver          : ApolloDriver,
            playground      : false,
            autoSchemaFile  : join( process.cwd(), 'src/schema.gql' ),
            plugins         : [ ApolloServerPluginLandingPageLocalDefault() ],
        }),
        UserModule,
        AuthModule,
        RolesModule,
        UserAttributeModule,
        PwdAdminModule,
        SecretsModule,

        // JwtModule.register({
        //     secret: process.env.JWT_SECRET || 'guardian-secret',
        //     signOptions: { expiresIn: '1h' },
        // }),
    ],
    controllers : [ AppController ],
    providers   : [],
})
export class AppModule {}
