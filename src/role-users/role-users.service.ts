import { Injectable } from '@nestjs/common';
import { CreateRoleUserInput } from './dto/create-role-user.input';
import { UpdateRoleUserInput } from './dto/update-role-user.input';

@Injectable()
export class RoleUsersService {
  create(createRoleUserInput: CreateRoleUserInput) {
    return 'This action adds a new roleUser';
  }

  findAll() {
    return `This action returns all roleUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} roleUser`;
  }

  update(id: number, updateRoleUserInput: UpdateRoleUserInput) {
    return `This action updates a #${id} roleUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} roleUser`;
  }
}
