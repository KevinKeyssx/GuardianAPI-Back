import { Logger, ValidationPipe }   from '@nestjs/common';
import { NestFactory }              from '@nestjs/core';

import { AppModule }    from './app.module';
import { ENVS }         from './config/envs';


( async () => {
    const logger    = new Logger( 'Main' );
    const app       = await NestFactory.create( AppModule );

    app.setGlobalPrefix( 'api/v1' )
    .useGlobalPipes(
        new ValidationPipe({
            whitelist: true
        }),
    )
    .enableCors({
        origin          : "*",
        credentials     : true,
        methods         : [ "GET", "POST", "PUT", "DELETE" ],
        allowedHeaders  : [ "Content-Type", "Authorization" ],
    });

    await app.listen( ENVS.PORT );
    logger.log( `GuardianAPI listening on port ${ ENVS.PORT }` );
})();
