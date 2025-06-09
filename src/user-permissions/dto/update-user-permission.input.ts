import { CreateUserPermissionInput } from './create-user-permission.input';
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateUserPermissionInput extends PartialType(CreateUserPermissionInput) {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  id: string;
}
