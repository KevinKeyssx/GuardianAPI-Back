import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class RoleUser {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
