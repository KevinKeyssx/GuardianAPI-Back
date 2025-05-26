import { ParseUUIDPipe, UseGuards }             from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID }  from '@nestjs/graphql';

import { SecretAuthGuard }                  from '@auth/guards/jwt-auth.guard';
import { CurrentUser }                      from '@auth/decorators/current-user.decorator';
import { AttributesArgs }                   from '@common/dto/args/attributes.args';
import { UserAttributeService }             from '@user-attribute/user-attribute.service';
import { UserAttribute }                    from '@user-attribute/entities/user-attribute.entity';
import { CreateUserAttributeInput }         from '@user-attribute/dto/create-user-attribute.input';
import { UpdateUserAttributeInput }         from '@user-attribute/dto/update-user-attribute.input';
import { User }                             from '@user/entities/user.entity';


@Resolver( () => UserAttribute )
export class UserAttributeResolver {
    constructor(
        private readonly userAttributeService: UserAttributeService
    ) {}


    @UseGuards( SecretAuthGuard( false ))
    @Mutation( () => UserAttribute )
    createUserAttribute(
        @CurrentUser() currentUser: User,
        @Args( 'createUserAttributeInput' ) createUserAttributeInput: CreateUserAttributeInput
    ) {
        return this.userAttributeService.create( currentUser, createUserAttributeInput );
    }


    @UseGuards( SecretAuthGuard( false ))
    @Query( () => [UserAttribute], { name: 'userAttributes' })
    findAll(
        @CurrentUser() currentUser: User,
        @Args() attributes  : AttributesArgs
    ) {
        return this.userAttributeService.findByKeys( currentUser.id, attributes );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Query( () => [UserAttribute], { name: 'userAttributesByUserId' })
    findAllByUserId(
        @CurrentUser() currentUser: User,
        @Args('userId', { type: () => ID }, ParseUUIDPipe ) userId: string,
        @Args() attributes  : AttributesArgs
    ) {
        return this.userAttributeService.findByKeys( userId, attributes, currentUser );
    }


    @UseGuards( SecretAuthGuard( false ))
    @Query( () => UserAttribute, { name: 'userAttribute' })
    findOne(
        @CurrentUser() currentUser: User,
        @Args('id', { type: () => ID }, ParseUUIDPipe ) id: string
    ) {
        return this.userAttributeService.findOne( currentUser, id );
    }


    @UseGuards( SecretAuthGuard( false ))
    @Mutation( () => UserAttribute )
    updateUserAttribute(
        @CurrentUser() currentUser: User,
        @Args( 'updateUserAttributeInput' ) updateUserAttributeInput: UpdateUserAttributeInput
    ) {
        return this.userAttributeService.update( currentUser, updateUserAttributeInput );
    }


    @UseGuards( SecretAuthGuard( false ))
    @Mutation( () => UserAttribute )
    removeUserAttribute(
        @CurrentUser() currentUser: User,
        @Args( 'id', { type: () => ID }) id: string
    ) {
        return this.userAttributeService.remove( currentUser, id );
    }
}
