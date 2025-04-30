import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request: Request = context.switchToHttp().getRequest();
        console.log('🚀 ~ file: csrf-token.guard.ts:8 ~ request:', request)
        if (!request.url.includes('/graphql')) return true; // Solo para GraphQL

        const csrfToken = request.headers['x-csrf-token'] as string;
        const storedCsrfToken = request.cookies?.csrfToken;

        if (!csrfToken || csrfToken !== storedCsrfToken) {
            throw new UnauthorizedException('Invalid CSRF token');
        }

        return true;
    }
}