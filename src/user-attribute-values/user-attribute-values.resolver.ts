import { ParseUUIDPipe, UseGuards }             from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID }  from '@nestjs/graphql';

import { SecretAuthGuard }                  from '@auth/guards/jwt-auth.guard';
import { CurrentUser }                      from '@auth/decorators/current-user.decorator';
import { UserAttributeValuesService }       from '@user-attribute-values/user-attribute-values.service';
import { UserAttributeValue }               from '@user-attribute-values/entities/user-attribute-value.entity';
import { CreateUserAttributeValueInput }    from '@user-attribute-values/dto/create-user-attribute-value.input';
import { User }                             from '@user/entities/user.entity';
import { ValueBasicInput }                  from '@user-attribute-values/dto/value-basic.dto';


@Resolver( () => UserAttributeValue )
export class UserAttributeValuesResolver {
    constructor(
        private readonly userAttributeValuesService: UserAttributeValuesService
    ) {}


    @UseGuards( SecretAuthGuard( true ))
    @Mutation( () => UserAttributeValue, { name: 'createUserAttributeValue' } )
    createUserAttributeValue(
        @Args('createUserAttributeValueInput') createUserAttributeValueInput: CreateUserAttributeValueInput,
        @CurrentUser() currentUser: User
    ) {
        return this.userAttributeValuesService.create( createUserAttributeValueInput, currentUser );
    }

    @UseGuards( SecretAuthGuard( true ))
    @Query( () => [UserAttributeValue], { name: 'userAttributeValues' })
    findAll(
        @CurrentUser() currentUser: User
    ) {
        return this.userAttributeValuesService.findAllByApiUser( currentUser );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Query(() => UserAttributeValue, { name: 'userAttributeValue' })
    findOne(
        @Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
        @CurrentUser() currentUser: User
    ) {
        return this.userAttributeValuesService.findOne( id, currentUser );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Mutation( () => UserAttributeValue, { name: 'updateUserAttributeValue' } )
    updateUserAttributeValue(
        @Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
        @Args( 'value' ) valueBasic: ValueBasicInput,
        @CurrentUser() currentUser: User
    ) {
        return this.userAttributeValuesService.update( id, valueBasic, currentUser );
    }


    @UseGuards( SecretAuthGuard( false ))
    @Mutation( () => UserAttributeValue, { name: 'updateUserAttributeValueByApiUser' } )
    updateUserAttributeValueByApiUser(
        @Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
        @Args( 'value' ) valueBasic: ValueBasicInput,
        @CurrentUser() currentUser: User
    ) {
        return this.userAttributeValuesService.updateByApiUser( id, valueBasic, currentUser );
    }

}
