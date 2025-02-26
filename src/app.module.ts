import { join } from 'path';

import { Module }                           from '@nestjs/common';
import { GraphQLModule }                    from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';


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

        // JwtModule.register({
        //     secret: process.env.JWT_SECRET || 'guardian-secret',
        //     signOptions: { expiresIn: '1h' },
        // }),
    ],
    controllers : [ AppController ],
    providers   : [],
})
export class AppModule {}
