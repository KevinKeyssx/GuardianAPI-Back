import * as stream  from 'stream';
import * as util    from 'util';

import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { FileUpload }           from 'graphql-upload-minimal';
import { fileTypeFromBuffer }   from 'file-type';

import { ENVS }                     from '@config/envs';
import { CloudinaryUploadResponse } from '@common/services/filemanager/model-file.model';


declare const Blob: {
    prototype: Blob;
    new( blobParts?: BlobPart[], options?: BlobPropertyBag ): Blob;
};


declare const File: {
    prototype: File;
    new(
        fileBits    : BlobPart[],
        fileName    : string,
        options?    : FilePropertyBag
    ): File;
};


const pipeline = util.promisify( stream.pipeline );


@Injectable()
export class FileManagerService {
    readonly #logger            = new Logger( FileManagerService.name );
    readonly #DEFAULT_FOLDER    = 'guardian_api';
    readonly #DEFAULT_FORMAT    = 'avif';
    readonly #DEFAULT_QUALITY   = 50;

    constructor() {}


    /**
     * Deletes a file from the file manager with retry logic
     * Attempts to delete the file up to 2 times before throwing an error
     */
    async delete( avatar: string, storage: string ) {
        const maxRetries = 2;
        let lastError: any;

        for ( let attempt = 1; attempt <= maxRetries; attempt++ ) {
            try {
                this.#logger.log( `Attempt ${attempt} from ${maxRetries} to delete the file: ${avatar}` );

                return await this.#deleteFile( avatar, storage );
            } catch ( error ) {
                lastError = error;
                this.#logger.warn( `Attempt ${attempt} failed for deleting file ${avatar}:`, error.message );

                if ( attempt < maxRetries ) {
                    await new Promise( resolve => setTimeout( resolve, 1000 ) );
                    continue;
                }
            }
        }

        const message = `Error deleting file after ${maxRetries} attempts`;
        this.#logger.error( message, lastError );
        throw new BadRequestException( message );
    }


    /**
     * Private method that handles the actual file deletion logic
     */
    async #deleteFile( avatar: string, storage: string ): Promise<boolean> {
        const avatarId  = avatar.split( '/' ).pop()?.split( '.' )[0];
        const url       = `${ENVS.FILE_MANAGER_URL}${ENVS.FILE_MANAGER_DELETE}${this.#DEFAULT_FOLDER}|${storage}|${avatarId}`;

        const response = await fetch( url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if ( !response.ok ) {
            throw new Error( 'Error deleting file' );
        }

        const data = await response.json();

        if ( data.result !== 'ok' ) {
            throw new Error( 'Error deleting file' );
        }

        return true;
    }


    /**
     * Saves a file to the file manager with retry logic
     * Attempts to save the file up to 2 times before throwing an error
     */
    async save(
        file    : FileUpload,
        storage : string,
        folder  : string = this.#DEFAULT_FOLDER,
        format  : string = this.#DEFAULT_FORMAT,
        quality : number = this.#DEFAULT_QUALITY
    ): Promise<CloudinaryUploadResponse> {
        const maxRetries = 2;
        let lastError: any;

        for ( let attempt = 1; attempt <= maxRetries; attempt++ ) {
            try {
                this.#logger.log( `Attempt ${attempt} from ${maxRetries} to upload the file: ${file.filename}` );

                return await this.#uploadFile( file, storage, folder, format, quality );
            } catch ( error ) {
                lastError = error;
                this.#logger.warn( `Attempt ${attempt} failed for the file ${file.filename}:`, error.message );

                if ( attempt < maxRetries ) {
                    await new Promise( resolve => setTimeout( resolve, 1000 ));
                    continue;
                }
            }
        }

        const message = `Error uploading file after ${maxRetries} attempts`;
        this.#logger.error( message, lastError );
        throw new BadRequestException( message );
    }


    /**
     * Private method that handles the actual file upload logic
     */
    async #uploadFile(
        file    : FileUpload,
        storage : string,
        folder  : string,
        format  : string,
        quality : number
    ): Promise<CloudinaryUploadResponse> {
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

        const fileBuffer        = Buffer.concat( chunks );
        const detectedFileType  = await fileTypeFromBuffer( fileBuffer );
        const actualMimeType    = detectedFileType ? detectedFileType.mime : file.mimetype;
        const fileBlob          = new File([ fileBuffer ], file.filename, { type: actualMimeType });

        formData.append( 'file', fileBlob, file.filename );

        const url = `${ENVS.FILE_MANAGER_URL}${ENVS.FILE_MANAGER_UPLOAD}${folder}|${storage}?format=${format}&quality=${quality}`;

        const response = await fetch( url, {
            method  : 'POST',
            body    : formData,
        });

        if ( !response.ok ) {
            const errorBody = await response.text();
            const message   = `Error uploading file: ${response.status} ${response.statusText} - ${errorBody}`;
            throw new Error( message );
        }

        return await response.json() as CloudinaryUploadResponse;
    }
}
