import { Module } from '@nestjs/common';

import { UserAttributeValuesService }   from '@user-attribute-values/user-attribute-values.service';
import { UserAttributeValuesResolver }  from '@user-attribute-values/user-attribute-values.resolver';


@Module({
    providers: [UserAttributeValuesResolver, UserAttributeValuesService],
})
export class UserAttributeValuesModule {}
