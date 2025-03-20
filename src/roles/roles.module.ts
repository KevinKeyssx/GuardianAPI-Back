import { Module } from '@nestjs/common';

import { RolesService }     from '@roles/roles.service';
import { RolesResolver }    from '@roles/roles.resolver';


@Module({
    providers: [ RolesResolver, RolesService ],
})
export class RolesModule {}
