import { Injectable } from '@nestjs/common';
import { CreateSecretInput } from './dto/create-secret.input';
import { UpdateSecretInput } from './dto/update-secret.input';

@Injectable()
export class SecretsService {
  create(createSecretInput: CreateSecretInput) {
    return 'This action adds a new secret';
  }

  findAll() {
    return `This action returns all secrets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} secret`;
  }

  update(id: number, updateSecretInput: UpdateSecretInput) {
    return `This action updates a #${id} secret`;
  }

  remove(id: number) {
    return `This action removes a #${id} secret`;
  }
}
