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

    static catch( exception: any, message?: string ) {
        if (exception.code === ERROR_MESSAGES.ALREADY_EXISTS) {
            this.#logger.error(`${message ?? exception.meta.target} already exists.`);
            throw new BadRequestException( `${ message ?? exception.meta.target} already exists.` );
        }

        if (exception.code === ERROR_MESSAGES.NOT_FOUND) {
            const id = (exception.message as string).split(':')[2].split('_')[0].replace(' `', '');
            this.#logger.error( `${message ?? id} not found.`);
            throw new BadRequestException( `${ message ?? id} not found.` );
        }

        this.#logger.error( `Error unknown ${ERROR_MESSAGES.UNKNOWN}: ${exception.code}` );
        throw new InternalServerErrorException( `Error unknown ${ERROR_MESSAGES.UNKNOWN}: ${exception.code}` );
    }
}
