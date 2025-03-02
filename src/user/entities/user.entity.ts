import { ObjectType, Field, ID } from '@nestjs/graphql';

import { Role }             from '@roles/entities/role.entity';
import { Secret }           from '@secrets/entities/secret.entity';
import { UserAttribute }    from '@user-attribute/entities/user-attribute.entity';
import { PwdAdmin }         from '@pwd-admin/entities/pwd-admin.entity';
import { UserRole }         from '@roles/entities/user-role.entity';


@ObjectType()
export class User {

    @Field(() => ID)
    id: string;

    @Field(() => String)
    email: string;

    @Field(() => String, { nullable: true })
    nickname?: string;

    @Field(() => String, { nullable: true })
    name?: string;

    @Field(() => Date, { nullable: true })
    birthdate?: Date;

    @Field(() => Boolean)
    isDeleted: boolean;

    @Field(() => Boolean)
    isActive: boolean;

    @Field(() => String, { nullable: true })
    avatar?: string;

    @Field(() => String, { nullable: true })
    googleId?: string;

    @Field(() => String, { nullable: true })
    microsoftId?: string;

    @Field(() => String, { nullable: true })
    facebookId?: string;

    @Field(() => String, { nullable: true })
    githubId?: string;

    @Field(() => String, { nullable: true })
    appleId?: string;

    @Field(() => String, { nullable: true })
    otherId?: string;

    @Field(() => String, { nullable: true })
    apiUserId?: string;

    @Field(() => User, { nullable: true })
    apiUser?: User;

    @Field(() => [User], { nullable: true })
    users?: User[];

    @Field(() => [Role], { nullable: true })
    roles?: Role[];

    @Field(() => [UserRole], { nullable: true })
    userRoles?: UserRole[];

    @Field(() => [Secret], { nullable: true })
    secrets?: Secret[];

    @Field(() => [PwdAdmin], { nullable: true })
    pwdAdmins?: PwdAdmin[];

    @Field(() => [UserAttribute], { nullable: true })
    attributes?: UserAttribute[];

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

}