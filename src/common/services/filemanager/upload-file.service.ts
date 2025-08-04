import * as stream  from 'stream';
import * as util    from 'util';

import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { FileUpload }           from 'graphql-upload-minimal';
import { fileTypeFromBuffer }   from 'file-type';
import imageSize                from 'image-size';

import { ENVS }                     from '@config/envs';
import { CloudinaryUploadResponse } from '@common/services/filemanager/model-file.model';


const pipeline = util.promisify( stream.pipeline );


@Injectable()
export class FileManagerService {
    readonly #logger            = new Logger( FileManagerService.name );
    readonly #DEFAULT_FOLDER    = 'guardian_api|users';
    readonly #DEFAULT_FORMAT    = 'avif';
    readonly #DEFAULT_QUALITY   = 50;

    constructor() {}


    /**
     * Deletes a file from the file manager with retry logic
     * Attempts to delete the file up to 2 times before throwing an error
     */
    async delete( avatar: string ) {
        const maxRetries = 2;
        let lastError: any;

        for ( let attempt = 1; attempt <= maxRetries; attempt++ ) {
            try {
                this.#logger.log( `Attempt ${attempt} from ${maxRetries} to delete the file: ${avatar}` );

                return await this.#deleteFile( avatar );
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
    async #deleteFile( avatar: string ): Promise<boolean> {
        const avatarId  = avatar.split( '/' ).pop()?.split( '.' )[0];
        const url       = `${ENVS.FILE_MANAGER_URL}${ENVS.FILE_MANAGER_DELETE}${this.#DEFAULT_FOLDER}|${avatarId}`;

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
        folder  : string = this.#DEFAULT_FOLDER,
        format  : string = this.#DEFAULT_FORMAT,
        quality : number = this.#DEFAULT_QUALITY
    ): Promise<CloudinaryUploadResponse> {
        const maxRetries = 2;
        let lastError: any;

        const fileStream = file.createReadStream();
        const chunks: Buffer[] = [];
        try {
            await pipeline(
                fileStream,
                new stream.Writable({
                    write( chunk, _, callback ) {
                        chunks.push( chunk );
                        callback();
                    }
                })
            );
        } catch ( streamError ) {
            this.#logger.error( `Error reading file stream for ${file.filename}:`, streamError.message );
            throw new BadRequestException( `Failed to read file stream: ${streamError.message}` );
        }

        const fileBuffer        = Buffer.concat( chunks );
        const detectedFileType  = await fileTypeFromBuffer( fileBuffer );
        const actualMimeType    = detectedFileType ? detectedFileType.mime : file.mimetype;

        for ( let attempt = 1; attempt <= maxRetries; attempt++ ) {
            try {
                this.#logger.log( `Attempt ${attempt} from ${maxRetries} to upload the file: ${file.filename}` );

                return await this.#uploadFile(
                    fileBuffer,
                    file.filename,
                    actualMimeType,
                    folder,
                    format,
                    quality
                );
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
     * Private method that handles the actual file upload logic using a buffer.
     * This method does NOT call createReadStream().
     */
    async #uploadFile(
        fileBuffer  : Buffer,
        filename    : string,
        mimetype    : string,
        folder      : string = this.#DEFAULT_FOLDER,
        format      : string = this.#DEFAULT_FORMAT,
        quality     : number = this.#DEFAULT_QUALITY
    ): Promise<CloudinaryUploadResponse> {
        const formData = new FormData();
        const fileBlob = new File([ fileBuffer ], filename, { type: mimetype });

        formData.append( 'file', fileBlob, filename );

        // Calculate 50% dimensions for image resizing
        const { width, height } = this.#calculateResizedDimensions( fileBuffer );

        // Build URL with resize parameters if dimensions were calculated successfully
        let url = `${ENVS.FILE_MANAGER_URL}${ENVS.FILE_MANAGER_UPLOAD}${folder}?format=${format}&quality=${quality}`;

        if ( width > 0 && height > 0 ) {
            url += `&width=${width}&height=${height}`;
        }

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


    /**
     * Calculates 50% dimensions of an image while maintaining aspect ratio
     * Returns the new width and height scaled down to 50%
     */
    #calculateResizedDimensions( fileBuffer: Buffer ): { width: number, height: number } {
        try {
            const dimensions = imageSize( fileBuffer );

            if ( !dimensions.width || !dimensions.height ) {
                throw new Error( 'Could not determine image dimensions' );
            }

            const newWidth  = Math.round( dimensions.width * 0.5 );
            const newHeight = Math.round( dimensions.height * 0.5 );

            return {
                width   : newWidth,
                height  : newHeight
            };
        } catch ( error ) {
            this.#logger.warn( 'Could not calculate image dimensions, using original size:', error.message );
            return { width: 0, height: 0 };
        }
    }

}
