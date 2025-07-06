import { join } from 'path';

import { Module, UnauthorizedException }    from '@nestjs/common';
import { GraphQLModule }                    from '@nestjs/graphql';
import { JwtService }                       from '@nestjs/jwt';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ScheduleModule }                   from '@nestjs/schedule';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { GraphQLUpload } from 'graphql-upload-minimal';

import { AppController }                from './app.controller';
import { AuthModule }                   from '@auth/auth.module';
import { CommonModule }                 from '@common/common.module';
import { UploadFileService }            from '@common/services/filemanager/upload-file.service';
import { UserModule }                   from '@user/user.module';
import { RolesModule }                  from '@roles/roles.module';
import { UserRolesModule }              from '@user-roles/user-roles.module';
import { UserAttributeModule }          from '@user-attribute/user-attribute.module';
import { SecretsModule }                from '@secrets/secrets.module';
import { PwdAdminModule }               from '@pwd-admin/pwd-admin.module';
import { PrismaModule }                 from '@prisma/prisma.module';
import { PermissionsModule }            from '@permissions/permissions.module';
import { UserPermissionsModule }        from '@user-permissions/user-permissions.module';
import { UserAttributeValuesModule }    from '@user-attribute-values/user-attribute-values.module';


@Module({
    imports     : [
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver      : ApolloDriver,
            imports     : [
                GraphQLModule.forRoot<ApolloDriverConfig>({
                    driver          : ApolloDriver,
                    autoSchemaFile  : join(process.cwd(), 'src/schema.gql'),
                    resolvers       : { Upload: GraphQLUpload },
                    context         : ({ req, res }) => ({ req, res }),
                }),
                AuthModule
            ],
            inject      : [ JwtService ],
            useFactory  : async( jwtService: JwtService ) => ({
                playground      : false,
                autoSchemaFile  : join( process.cwd(), 'src/schema.gql' ),
                plugins         : [ ApolloServerPluginLandingPageLocalDefault() ],
                context         : ({ req }) => {
                    try {
                        let token = req.cookies?.token;

                        if ( !token ) {
                            token = req.headers.authorization?.split(' ')[1];
                            console.log('🚀 ~ file: app.module.ts:39 ~ token:', token)

                            if ( !token ) throw new UnauthorizedException( 'Token needed' );
                        }

                        const payload = jwtService.decode( token ); // Usa verify en lugar de decode para validar
                        // const payload = jwtService.verify( token ); // Usa verify en lugar de decode para validar
                        if ( !payload ) throw new UnauthorizedException( 'Invalid token' );

                        return { user: payload };
                    } catch (error) {
                        console.error('Error in GraphQL context:', error.message);
                        throw new UnauthorizedException( 'Invalid token' );
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
        PermissionsModule,
        UserPermissionsModule,
    ],
    controllers : [ AppController ],
    providers   : [ UploadFileService ],
})
export class AppModule {}
