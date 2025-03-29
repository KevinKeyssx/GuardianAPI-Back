import { Module }                           from '@nestjs/common';
import { JwtModule }                        from '@nestjs/jwt';
import { PassportModule }                   from '@nestjs/passport';
import { DocumentBuilder, SwaggerModule }   from '@nestjs/swagger';
import { INestApplication }                 from '@nestjs/common/interfaces';

import { AuthService }      from '@auth/auth.service';
import { AuthController }   from '@auth/auth.controller';
import { JwtStrategy }      from '@auth/strategies/jwt.strategy';
import { SocialService }    from '@auth/services/Social.services';
import { ENVS }             from '@config/envs';
import { SecretsModule }    from '@secrets/secrets.module';


@Module({
    controllers : [ AuthController ],
    exports     : [ JwtStrategy, PassportModule, JwtModule ],
    providers   : [ AuthService, JwtStrategy, SocialService ],
    imports     : [ 
        PassportModule.register({ defaultStrategy: 'jwt' }),

        JwtModule.register({
            global      : true,
            secret      : ENVS.JWT_SECRET,
            signOptions : { expiresIn: '2h' },
        }),

        SecretsModule
    ]
})
export class AuthModule {
    static setupSwagger( app: INestApplication ) {
        const config = new DocumentBuilder()
            .setTitle( 'GuardianAPI Auth' )
            .setDescription( 'GuardianAPI Documentation' )
            .setVersion( '1.0' )
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument( app, config );
        SwaggerModule.setup( 'docs', app, document );
    }
}
