import { Module } from '@nestjs/common';

import { SecretsService }   from '@secrets/secrets.service';
import { SecretsResolver }  from '@secrets/secrets.resolver';


@Module({
    providers   : [ SecretsResolver, SecretsService ],
    exports     : [ SecretsService ]
})
export class SecretsModule {}
