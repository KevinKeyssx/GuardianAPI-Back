import { Module } from '@nestjs/common';

import { UserAttributeService }     from '@user-attribute/user-attribute.service';
import { UserAttributeResolver }    from '@user-attribute/user-attribute.resolver';

@Module({
    providers   : [UserAttributeResolver, UserAttributeService],
    exports     : [UserAttributeService]
})
export class UserAttributeModule {}
