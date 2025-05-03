import { Request } from 'express';
import {
    ForbiddenException,
    Injectable,
    UnauthorizedException
}                           from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService }      from '@auth/auth.service';
import { JwtPayload }       from '@auth/interfaces/jwt-payload.interface';
import { ENVS }             from '@config/envs';
import { User }             from '@user/entities/user.entity';
import { SecretsService }   from '@secrets/secrets.service';


@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        private readonly authService: AuthService,
        private readonly secretsService: SecretsService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    const token = request.cookies?.token;
                    if (token) {
                        request.token = token;
                        request.secret = request.headers['secret'] as string;
                        return token;
                    }
                    return null;
                },
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            secretOrKey: ENVS.JWT_SECRET,
            passReqToCallback: true,
        });
    }


    async validate( req: Request, payload: JwtPayload ): Promise<User> {
        const secret    = req['secret'];
        const userId    = payload.id;
        const access    = req['access'];
        const user      = await this.authService.validate( userId );
        const role      = user.roles?.find( role => role.name === ENVS.ROLE_SECRET );

        if ( role && !user.apiUserId ) return user;

        if ( !access ) throw new ForbiddenException ( `Permission denied.` );
        if ( !secret ) throw new UnauthorizedException( 'Secret not provided.' );

        const secretValid = await this.secretsService.validateSecret( user.apiUserId!, secret );

        if ( !secretValid ) throw new UnauthorizedException( 'Invalid secret.' );

        return user;
    }

}