import { CreatePwdAdminInput } from './create-pwd-admin.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePwdAdminInput extends PartialType(CreatePwdAdminInput) {
  @Field(() => Int)
  id: number;
}
