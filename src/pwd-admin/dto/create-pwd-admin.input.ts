import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreatePwdAdminInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
