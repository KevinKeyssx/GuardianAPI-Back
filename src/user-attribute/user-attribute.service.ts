import { Injectable } from '@nestjs/common';
import { CreateUserAttributeInput } from './dto/create-user-attribute.input';
import { UpdateUserAttributeInput } from './dto/update-user-attribute.input';

@Injectable()
export class UserAttributeService {
  create(createUserAttributeInput: CreateUserAttributeInput) {
    return 'This action adds a new userAttribute';
  }

  findAll() {
    return `This action returns all userAttribute`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userAttribute`;
  }

  update(id: number, updateUserAttributeInput: UpdateUserAttributeInput) {
    return `This action updates a #${id} userAttribute`;
  }

  remove(id: number) {
    return `This action removes a #${id} userAttribute`;
  }
}
