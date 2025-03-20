import {
    BadRequestException,
    InternalServerErrorException,
    Logger
} from '@nestjs/common';


export enum ERROR_MESSAGES {
    ALREADY_EXISTS  = 'P2002',
    NOT_FOUND       = 'P2003',
    UNKNOWN         = 'P0000x'
}


export class PrismaException {
    static readonly #logger = new Logger( PrismaException.name );

    static catch( exception: any ) {
        if (exception.code === ERROR_MESSAGES.ALREADY_EXISTS) {
            this.#logger.error(`${exception.meta.target} already exists.`);
            throw new BadRequestException( `${exception.meta.target} already exists.` );
        }

        if (exception.code === ERROR_MESSAGES.NOT_FOUND) {
            const id = (exception.message as string).split(':')[2].split('_')[0].replace(' `', '');
            this.#logger.error(`${id} not found.`);
            throw new BadRequestException( `${id} not found.` );
        }

        this.#logger.error( `Error unknown ${ERROR_MESSAGES.UNKNOWN}: ${exception.code}` );
        throw new InternalServerErrorException( `Error unknown ${ERROR_MESSAGES.UNKNOWN}: ${exception.code}` );
    }
}
