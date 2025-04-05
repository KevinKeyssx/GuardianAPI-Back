import { Request } from 'express';

import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
}                       from '@nestjs/common';
import { JwtService }   from '@nestjs/jwt';

import { AuthService }  from '@auth/auth.service';
import { ENVS }         from '@config/envs';


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private readonly authService: AuthService
    ) {}

    async canActivate( context: ExecutionContext ): Promise<boolean> {
        const request   = context.switchToHttp().getRequest();
        const token     = this.#extractTokenFromHeader( request );

        if ( !token ) throw new UnauthorizedException( 'Invalid token' );

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: ENVS.JWT_SECRET
                }
            );
            const user = await this.authService.validate( payload.id );

            request['user']     = user;
            request['token']    = token;
            request['secret']   = request.headers.secret;
        } catch {
            throw new UnauthorizedException( 'Invalid token' );
        }

        return true;
    }


    #extractTokenFromHeader( request: Request ): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];

        return type === 'Bearer' ? token : undefined;
    }
}
