import { Logger, ValidationPipe }   from '@nestjs/common';
import { NestFactory }              from '@nestjs/core';

import * as cookieParser from 'cookie-parser';

import { AppModule }    from './app.module';
import { ENVS }         from '@config/envs';
import { AuthModule }   from '@auth/auth.module';
import { CsrfGuard } from '@auth/guards/csrf-token.guard';


( async () => {
    const logger    = new Logger( 'Main' );
    const app       = await NestFactory.create( AppModule );

    const allowedOrigins = [
        'http://localhost:4321',
        'https://guardianapi.vercel.app',
        'http://localhost:3007',
        'https://studio.apollographql.com'
    ];

    app.setGlobalPrefix( 'api/v1' )
    .useGlobalPipes( new ValidationPipe({ whitelist: true }))
    .useGlobalGuards(new CsrfGuard())
    .use(cookieParser())
    .enableCors({
        origin: ( origin: string | undefined, callback: ( error: Error | null, origin?: string ) => void ) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, origin || '*');
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'secret', 'X-CSRF-Token'],
    });

    AuthModule.setupSwagger( app );

    await app.listen( ENVS.PORT );
    logger.log( `GuardianAPI listening on port ${ ENVS.PORT }` );
})();
