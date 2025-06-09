import { Field, ObjectType } from '@nestjs/graphql';
import { UserPermission } from './user-permission.entity';

@ObjectType()
class UserPermissionError {
  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  permissionId?: string;

  @Field()
  error: string;
}

@ObjectType()
export class AssignUsersPermissionsResponse {
  @Field(() => [UserPermission], { nullable: 'itemsAndList' })
  success?: UserPermission[];

  @Field(() => [UserPermissionError], { nullable: 'itemsAndList' })
  errors?: UserPermissionError[];
}
