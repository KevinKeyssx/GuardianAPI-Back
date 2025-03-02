import { Injectable } from '@nestjs/common';
import { CreatePwdAdminInput } from './dto/create-pwd-admin.input';
import { UpdatePwdAdminInput } from './dto/update-pwd-admin.input';

@Injectable()
export class PwdAdminService {
  create(createPwdAdminInput: CreatePwdAdminInput) {
    return 'This action adds a new pwdAdmin';
  }

  findAll() {
    return `This action returns all pwdAdmin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pwdAdmin`;
  }

  update(id: number, updatePwdAdminInput: UpdatePwdAdminInput) {
    return `This action updates a #${id} pwdAdmin`;
  }

  remove(id: number) {
    return `This action removes a #${id} pwdAdmin`;
  }
}
