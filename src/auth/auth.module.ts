import { Module }           from '@nestjs/common';
import { JwtModule }        from '@nestjs/jwt';
import { PassportModule }   from '@nestjs/passport';

import { AuthService }      from '@auth/auth.service';
import { AuthController }   from '@auth/auth.controller';
import { JwtStrategy }      from '@auth/strategies/jwt.strategy';
import { ENVS }             from '@config/envs';
import { SecretsModule }    from '@secrets/secrets.module';


@Module({
    controllers : [ AuthController ],
    exports     : [ JwtStrategy, PassportModule, JwtModule ],
    providers   : [ AuthService, JwtStrategy ],
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
export class AuthModule {}
