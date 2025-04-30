import { Logger, ValidationPipe }   from '@nestjs/common';
import { NestFactory }              from '@nestjs/core';

import { AppModule }    from './app.module';
import { ENVS }         from '@config/envs';
import { AuthModule }   from '@auth/auth.module';
import * as cookieParser from 'cookie-parser';
import { CsrfGuard } from '@auth/guards/csrf-token.guard';


( async () => {
    const logger    = new Logger( 'Main' );
    const app       = await NestFactory.create( AppModule );

    app.setGlobalPrefix( 'api/v1' )
    .useGlobalPipes(
        new ValidationPipe({
            whitelist: true
        }),
    )
    // .useGlobalGuards(new CsrfGuard())
    .use(cookieParser())
    .enableCors({
        origin          : "*",
        credentials     : true,
        methods         : [ "GET", "POST", "PUT", "DELETE" ],
        allowedHeaders: ['Content-Type', 'Authorization', 'secret', 'X-CSRF-Token'],
    })

    AuthModule.setupSwagger( app );

    await app.listen( ENVS.PORT );
    logger.log( `GuardianAPI listening on port ${ ENVS.PORT }` );
})();
