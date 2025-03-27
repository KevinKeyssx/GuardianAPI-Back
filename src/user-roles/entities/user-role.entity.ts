import { ObjectType, Field, ID } from '@nestjs/graphql';

import { Role } from '@roles/entities/role.entity';
import { User } from '@user/entities/user.entity';


@ObjectType()
export class UserRole {

    @Field(() => ID, { description: 'Example field (placeholder)' })   
    id: string;

    @Field(() => User, { description: 'Example field (placeholder)' })   
    user: User;

    @Field(() => Role, { description: 'Example field (placeholder)' })   
    role: Role;

}
