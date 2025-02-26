import { Logger, ValidationPipe }   from '@nestjs/common';
import { NestFactory }              from '@nestjs/core';

import { AppModule } from './app.module';


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
    })

    await app.listen( process.env.PORT ?? 3000 );
    logger.log( `GuardianAPI listening on port ${ process.env.PORT ?? 3000 }` );
})();
