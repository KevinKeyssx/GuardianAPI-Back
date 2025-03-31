import { ObjectType, Field } from '@nestjs/graphql';

import { BasicUser }    from '@user/entities/basic-user';
import { SecretEntity } from '@secrets/entities/secret.entity';
import { PwdAdmin }     from '@pwd-admin/entities/pwd-admin.entity';

@ObjectType()
export class UserResponse extends BasicUser {

    @Field(() => SecretEntity, { nullable: true })
    secret?: SecretEntity;

    @Field(() => PwdAdmin, { nullable: true })
    pwdAdmin?: PwdAdmin;

}
