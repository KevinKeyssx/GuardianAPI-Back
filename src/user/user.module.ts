import { Module } from '@nestjs/common';

import { UserService }  from '@user/user.service';
import { UserResolver } from '@user/user.resolver';


@Module({
    providers: [UserResolver, UserService],
})
export class UserModule {}
