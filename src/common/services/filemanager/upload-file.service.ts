import * as stream  from 'stream';
import * as util    from 'util';

import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { FileUpload } from 'graphql-upload-minimal';

import { ENVS }                     from '@config/envs';
import { CloudinaryUploadResponse } from '@common/services/filemanager/model-file.model';


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
export class UploadFileService {
    private readonly logger             = new Logger(UploadFileService.name);
    private readonly DEFAULT_FOLDER     = 'guardianapi';
    private readonly DEFAULT_FORMAT     = 'avif';
    private readonly DEFAULT_QUALITY    = 50;

    constructor() {}

    async sendFile(
        file    : FileUpload,
        folder  : string = this.DEFAULT_FOLDER,
        format  : string = this.DEFAULT_FORMAT,
        quality : number = this.DEFAULT_QUALITY
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
            const fileBlob      = new File([ fileBuffer ], file.filename, { type: file.mimetype });

            formData.append( 'file', fileBlob, file.filename );

            const url = `${ENVS.FILE_MANAGER_URL}${folder}?format=${format}&quality=${quality}`;

            const response = await fetch( url, {
                method  : 'POST',
                body    : formData,
            });

            if ( !response.ok ) {
                const errorBody = await response.text();
                const message   = `Error al subir el archivo: ${response.status} ${response.statusText} - ${errorBody}`;
                this.logger.error( message );
                throw new BadRequestException( message );
            }

            return await response.json() as CloudinaryUploadResponse;
        } catch ( error ) {
            const message = 'Error al subir el archivo';
            this.logger.error( message, error );
            throw new BadRequestException( message );
        }
    }
}