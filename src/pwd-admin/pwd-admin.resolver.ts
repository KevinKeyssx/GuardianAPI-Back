import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PwdAdminService } from './pwd-admin.service';
import { PwdAdmin } from './entities/pwd-admin.entity';
import { CreatePwdAdminInput } from './dto/create-pwd-admin.input';
import { UpdatePwdAdminInput } from './dto/update-pwd-admin.input';

@Resolver(() => PwdAdmin)
export class PwdAdminResolver {
  constructor(private readonly pwdAdminService: PwdAdminService) {}

  @Mutation(() => PwdAdmin)
  createPwdAdmin(@Args('createPwdAdminInput') createPwdAdminInput: CreatePwdAdminInput) {
    return this.pwdAdminService.create(createPwdAdminInput);
  }

  @Query(() => [PwdAdmin], { name: 'pwdAdmin' })
  findAll() {
    return this.pwdAdminService.findAll();
  }

  @Query(() => PwdAdmin, { name: 'pwdAdmin' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.pwdAdminService.findOne(id);
  }

  @Mutation(() => PwdAdmin)
  updatePwdAdmin(@Args('updatePwdAdminInput') updatePwdAdminInput: UpdatePwdAdminInput) {
    return this.pwdAdminService.update(updatePwdAdminInput.id, updatePwdAdminInput);
  }

  @Mutation(() => PwdAdmin)
  removePwdAdmin(@Args('id', { type: () => Int }) id: number) {
    return this.pwdAdminService.remove(id);
  }
}
