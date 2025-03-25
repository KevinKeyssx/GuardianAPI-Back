import { CreateRoleUserInput } from './create-role-user.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateRoleUserInput extends PartialType(CreateRoleUserInput) {
  @Field(() => Int)
  id: number;
}
