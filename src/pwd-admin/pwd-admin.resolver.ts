import { UseGuards }                from '@nestjs/common';
import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { SecretAuthGuard }      from '@auth/guards/jwt-auth.guard';
import { CurrentUser }          from '@auth/decorators/current-user.decorator';
import { PwdAdminService }      from '@pwd-admin/pwd-admin.service';
import { PwdAdmin }             from '@pwd-admin/entities/pwd-admin.entity';
import { UpdatePwdAdminInput }  from '@pwd-admin/dto/update-pwd-admin.input';
import { UpdatePwdInput }       from '@pwd-admin/dto/update-pwd.input';
import { User }                 from '@user/entities/user.entity';


@UseGuards( SecretAuthGuard( true ))
@Resolver( () => PwdAdmin )
export class PwdAdminResolver {
    constructor(
        private readonly pwdAdminService: PwdAdminService
    ) {}


    @Mutation( () => PwdAdmin, { name: 'activeGuardian' })
    activeGuardian(
        @CurrentUser() currentUser: User,
        @Args( 'updatePwdAdminInput' ) updatePwdAdminInput: UpdatePwdAdminInput
    ) {
        return this.pwdAdminService.activeGuardian( currentUser, updatePwdAdminInput );
    }


    @Mutation( () => PwdAdmin, { name: 'changePassword' })
    changePassword(
        @CurrentUser() currentUser: User,
        @Args( 'updatePwdInput' ) updatePwdInput: UpdatePwdInput
    ) {
        return this.pwdAdminService.changePassword( currentUser, updatePwdInput );
    }

}
