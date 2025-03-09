import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient, UserAttribute } from '@prisma/client';

import { CreateUserAttributeInput } from '@user-attribute/dto/create-user-attribute.input';
import { UpdateUserAttributeInput } from '@user-attribute/dto/update-user-attribute.input';

@Injectable()
export class UserAttributeService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
		this.$connect();
	}


    async create(
        createUserAttributeInput: CreateUserAttributeInput
    ): Promise<UserAttribute> {
        return this.userAttribute.create({
            data: createUserAttributeInput
        });
    }


    findAll() {
        return `This action returns all userAttribute`;
    }


    findOne(id: string) {
        return `This action returns a #${id} userAttribute`;
    }


    update(
        updateUserAttributeInput: UpdateUserAttributeInput
    ) {
        return `This action updates a #${updateUserAttributeInput.id} userAttribute`;
    }


    remove( id: string ) {
        return `This action removes a #${id} userAttribute`;
    }
}
