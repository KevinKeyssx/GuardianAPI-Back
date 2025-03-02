import { CreateUserAttributeInput } from './create-user-attribute.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserAttributeInput extends PartialType(CreateUserAttributeInput) {
  @Field(() => Int)
  id: number;
}
