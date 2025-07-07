import * as stream  from 'stream';
import * as util    from 'util';

import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { FileUpload } from 'graphql-upload-minimal';

import { ENVS }                     from '@config/envs';
import { CloudinaryUploadResponse } from '@common/services/filemanager/model-file.model';


import { fileTypeFromBuffer } from 'file-type';


declare const Blob: {
    prototype: Blob;
    new(blobParts?: BlobPart[], options?: BlobPropertyBag): Blob;
};

declare const File: {
    prototype: File;
    new(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File;
};

const pipeline = util.promisify(stream.pipeline);

@Injectable()
export class FileManagerService {
    readonly #logger            = new Logger( FileManagerService.name );
    readonly #DEFAULT_FOLDER    = 'guardian_api';
    readonly #DEFAULT_FORMAT    = 'avif';
    readonly #DEFAULT_QUALITY   = 50;

    constructor() {}


    async delete( avatar: string, storage: string ) {
        const avatarId  = avatar.split( '/' ).pop()?.split( '.' )[0];
        const url       = `${this.#DEFAULT_FOLDER}|${storage}|${avatarId}`;

        try {
            const response = await fetch( url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if ( !response.ok ) {
                throw new BadRequestException( 'Error al eliminar el archivo' );
            }

            const data = await response.json();

            if ( data.result !== 'ok' ) {
                throw new BadRequestException( 'Error al eliminar el archivo' );
            }

            return true;
        }
        catch ( error ) {
            throw new BadRequestException( 'Error al eliminar el archivo' );
        }
    }


    async save(
        file    : FileUpload,
        storage : string,
        folder  : string = this.#DEFAULT_FOLDER,
        format  : string = this.#DEFAULT_FORMAT,
        quality : number = this.#DEFAULT_QUALITY
    ): Promise<CloudinaryUploadResponse> {
        try {
            const formData          = new FormData();
            const fileStream        = file.createReadStream();
            const chunks: Buffer[]  = [];

            await pipeline(
                fileStream,
                new stream.Writable({
                    write( chunk, _, callback ) {
                        chunks.push( chunk );
                        callback();
                    }
                })
            );
            const fileBuffer    = Buffer.concat( chunks );
            const detectedFileType = await fileTypeFromBuffer(fileBuffer);
            const actualMimeType = detectedFileType ? detectedFileType.mime : file.mimetype;
            const fileBlob      = new File([ fileBuffer ], file.filename, { type: actualMimeType });

            formData.append( 'file', fileBlob, file.filename );

            const url = `${ENVS.FILE_MANAGER_URL}${folder}|${storage}?format=${format}&quality=${quality}`;

            const response = await fetch( url, {
                method  : 'POST',
                body    : formData,
            });

            if ( !response.ok ) {
                const errorBody = await response.text();
                const message   = `Error al subir el archivo: ${response.status} ${response.statusText} - ${errorBody}`;
                this.#logger.error( message );
                throw new BadRequestException( message );
            }

            return await response.json() as CloudinaryUploadResponse;
        } catch ( error ) {
            const message = 'Error al subir el archivo';
            this.#logger.error( message, error );

            if ( error.code == 502 ) {
                return this.save( file, storage );
            }

            throw new BadRequestException( message );
        }
    }
}