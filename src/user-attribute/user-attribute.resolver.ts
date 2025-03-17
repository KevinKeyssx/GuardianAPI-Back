import { UseGuards }                            from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID }  from '@nestjs/graphql';

import { SecretAuthGuard }                  from '@auth/guards/jwt-auth.guard';
import { UserAttributeService }             from '@user-attribute/user-attribute.service';
import { UserAttribute }                    from '@user-attribute/entities/user-attribute.entity';
import { CreateUserAttributeInput }         from '@user-attribute/dto/create-user-attribute.input';
import { UpdateUserAttributeInput }         from '@user-attribute/dto/update-user-attribute.input';
import { UpdateValueUserAttributeInput }    from '@user-attribute/dto/update-value-user-attribute.input';
import { ValueAttribute }                   from '@user-attribute/entities/value-attribute.entity';


@Resolver( () => UserAttribute )
export class UserAttributeResolver {
    constructor(
        private readonly userAttributeService: UserAttributeService
    ) {}


    @UseGuards( SecretAuthGuard( false ))
    @Mutation( () => UserAttribute )
    createUserAttribute(
        @Args( 'createUserAttributeInput' ) createUserAttributeInput: CreateUserAttributeInput
    ) {
        return this.userAttributeService.create( createUserAttributeInput );
    }


    @UseGuards( SecretAuthGuard( false ))
    @Query( () => [UserAttribute], { name: 'userAttributes' })
    findAll(
        @Args('userId', { type: () => ID }) userId: string
    ) {
        return this.userAttributeService.findAll( userId );
    }


    @UseGuards( SecretAuthGuard( false ))
    @Query( () => UserAttribute, { name: 'userAttribute' })
    findOne(
        @Args('id', { type: () => ID }) id: string
    ) {
        return this.userAttributeService.findOne( id );
    }


    @UseGuards( SecretAuthGuard( false ))
    @Mutation( () => UserAttribute )
    updateUserAttribute(
        @Args( 'updateUserAttributeInput' ) updateUserAttributeInput: UpdateUserAttributeInput
    ) {
        return this.userAttributeService.update( updateUserAttributeInput );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Mutation( () => ValueAttribute, { name: 'updateValueUserAttribute' })
    updateValueUserAttribute(
        @Args( 'updateValueUserAttributeInput' ) updateUserAttributeInput: UpdateValueUserAttributeInput
    ) {
        return this.userAttributeService.updateValue( updateUserAttributeInput );
    }


    @UseGuards( SecretAuthGuard( false ))
    @Mutation( () => UserAttribute )
    removeUserAttribute(
        @Args( 'id', { type: () => ID }) id: string
    ) {
        return this.userAttributeService.remove( id );
    }
}
