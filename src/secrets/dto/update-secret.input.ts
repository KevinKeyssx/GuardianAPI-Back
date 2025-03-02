import { CreateSecretInput } from './create-secret.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateSecretInput extends PartialType(CreateSecretInput) {
  @Field(() => Int)
  id: number;
}
