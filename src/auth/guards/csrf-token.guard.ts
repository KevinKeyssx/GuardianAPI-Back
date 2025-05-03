import { Request } from 'express';

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class CsrfGuard implements CanActivate {
    private readonly logger = new Logger(CsrfGuard.name);

    canActivate(context: ExecutionContext): boolean {
        let request: Request;

        if ( context.getType<string>() === 'graphql' ) {
            const gqlContext = GqlExecutionContext.create( context );
            const ctx = gqlContext.getContext();
            request = ctx.req;
        } else {
            request = context.switchToHttp().getRequest<Request>();
        }

        if ( !request ) {
            this.logger.error('Request object is undefined');
            throw new UnauthorizedException( 'Unable to process request' );
        }

        this.logger.debug(`Checking CSRF for URL: ${request.url || 'unknown'}, Origin: ${request.headers.origin || 'undefined'}`);

        if ( !request.url.includes('/graphql' )) {
            this.logger.debug( 'Non-GraphQL request, skipping CSRF validation' );
            return true;
        }

        const isDevelopment = process.env.NODE_ENV === 'development';
        const bypassCsrf    = request.headers['x-apollo-bypass-csrf'] === 'true';

        if ( isDevelopment && bypassCsrf ) {
            this.logger.debug( 'CSRF validation bypassed in development with X-Apollo-Bypass-CSRF' );
            return true;
        }

        const csrfToken = request.headers['x-csrf-token'] as string;
        const storedCsrfToken = request.cookies?.csrfToken;

        this.logger.debug( `CSRF Token: ${csrfToken}, Stored CSRF Token: ${storedCsrfToken}` );

        if ( !csrfToken || csrfToken !== storedCsrfToken ) {
            this.logger.error( 'Invalid CSRF token' );
            throw new UnauthorizedException( 'Invalid CSRF token' );
        }

        this.logger.debug( 'CSRF validation passed' );
        return true;
    }
}