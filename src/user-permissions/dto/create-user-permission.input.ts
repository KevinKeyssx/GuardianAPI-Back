import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateUserPermissionInput {
  @Field(() => ID, { description: 'User ID to assign permission to' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  userId: string;

  @Field(() => ID, { description: 'Permission ID to assign' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  permissionId: string;
}
