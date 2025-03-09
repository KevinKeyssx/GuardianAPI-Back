import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { PwdAdminService }      from '@pwd-admin/pwd-admin.service';
import { PwdAdmin }             from '@pwd-admin/entities/pwd-admin.entity';
import { UpdatePwdAdminInput }  from '@pwd-admin/dto/update-pwd-admin.input';


@Resolver( () => PwdAdmin )
export class PwdAdminResolver {
    constructor(
        private readonly pwdAdminService: PwdAdminService
    ) {}


    @Mutation( () => PwdAdmin )
    updatePwdAdmin(
        @Args( 'updatePwdAdminInput' ) updatePwdAdminInput: UpdatePwdAdminInput
    ) {
        return this.pwdAdminService.update( updatePwdAdminInput );
    }

}
