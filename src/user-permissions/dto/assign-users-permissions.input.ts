import { Field, ID, InputType } from '@nestjs/graphql';
import { ArrayMinSize, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class AssignUsersPermissionsInput {
  @Field(() => [ID], { description: 'Array of User IDs' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  @IsNotEmpty({ each: true })
  userIds: string[];

  @Field(() => [ID], { description: 'Array of Permission IDs' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  @IsNotEmpty({ each: true })
  permissionIds: string[];
}
