import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Role }             from '@roles/entities/role.entity';
import { UserAttribute }    from '@user-attribute/entities/user-attribute.entity';
import { UserRole }         from '@user-roles/entities/user-role.entity';
import { User }             from '@user/entities/user.entity';
import { Plan }             from '@user/entities/plan.entity';

@ObjectType()
export class BasicUser {

    @Field( () => ID )
    id: string;

    @Field( () => String )
    email: string;

    @Field(() => String, { nullable: true })
    nickname?: string;

    @Field(() => String, { nullable: true })
    name?: string;

    @Field(() => Date, { nullable: true })
    birthdate?: Date;

    @Field(() => String, { nullable: true })
    phone?: string;

    @Field(() => Boolean)
    isActive: boolean;

    @Field(() => String, { nullable: true })
    avatar?: string;

    apiUserId?: string;
    apiUser?: User;
    users?: User[];
    roles?: Role[];
    attributes?: UserAttribute[];

    planId?: string;
    plan?: Plan;

    @Field(() => [UserRole], { nullable: true })
    userRoles?: UserRole[];

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

}