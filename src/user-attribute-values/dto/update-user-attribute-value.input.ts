import { CreateUserAttributeValueInput } from './create-user-attribute-value.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserAttributeValueInput extends PartialType(CreateUserAttributeValueInput) {
  @Field(() => Int)
  id: number;
}
