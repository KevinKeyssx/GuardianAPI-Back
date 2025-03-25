import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RoleUsersService } from './role-users.service';
import { RoleUser } from './entities/role-user.entity';
import { CreateRoleUserInput } from './dto/create-role-user.input';
import { UpdateRoleUserInput } from './dto/update-role-user.input';

@Resolver(() => RoleUser)
export class RoleUsersResolver {
  constructor(private readonly roleUsersService: RoleUsersService) {}

  @Mutation(() => RoleUser)
  createRoleUser(@Args('createRoleUserInput') createRoleUserInput: CreateRoleUserInput) {
    return this.roleUsersService.create(createRoleUserInput);
  }

  @Query(() => [RoleUser], { name: 'roleUsers' })
  findAll() {
    return this.roleUsersService.findAll();
  }

  @Query(() => RoleUser, { name: 'roleUser' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.roleUsersService.findOne(id);
  }

  @Mutation(() => RoleUser)
  updateRoleUser(@Args('updateRoleUserInput') updateRoleUserInput: UpdateRoleUserInput) {
    return this.roleUsersService.update(updateRoleUserInput.id, updateRoleUserInput);
  }

  @Mutation(() => RoleUser)
  removeRoleUser(@Args('id', { type: () => Int }) id: number) {
    return this.roleUsersService.remove(id);
  }
}
