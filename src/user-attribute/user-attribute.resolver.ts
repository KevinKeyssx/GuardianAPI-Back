import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserAttributeService } from './user-attribute.service';
import { UserAttribute } from './entities/user-attribute.entity';
import { CreateUserAttributeInput } from './dto/create-user-attribute.input';
import { UpdateUserAttributeInput } from './dto/update-user-attribute.input';

@Resolver(() => UserAttribute)
export class UserAttributeResolver {
  constructor(private readonly userAttributeService: UserAttributeService) {}

  @Mutation(() => UserAttribute)
  createUserAttribute(@Args('createUserAttributeInput') createUserAttributeInput: CreateUserAttributeInput) {
    return this.userAttributeService.create(createUserAttributeInput);
  }

  @Query(() => [UserAttribute], { name: 'userAttribute' })
  findAll() {
    return this.userAttributeService.findAll();
  }

  @Query(() => UserAttribute, { name: 'userAttribute' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.userAttributeService.findOne(id);
  }

  @Mutation(() => UserAttribute)
  updateUserAttribute(@Args('updateUserAttributeInput') updateUserAttributeInput: UpdateUserAttributeInput) {
    return this.userAttributeService.update(updateUserAttributeInput.id, updateUserAttributeInput);
  }

  @Mutation(() => UserAttribute)
  removeUserAttribute(@Args('id', { type: () => Int }) id: number) {
    return this.userAttributeService.remove(id);
  }
}
