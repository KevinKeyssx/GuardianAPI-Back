import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';

import { SecretAuthGuard } from '@auth/guards/jwt-auth.guard';
import { UserAttributeValuesService } from './user-attribute-values.service';
import { UserAttributeValue } from './entities/user-attribute-value.entity';
import { CreateUserAttributeValueInput } from './dto/create-user-attribute-value.input';
import { UpdateUserAttributeValueInput } from './dto/update-user-attribute-value.input';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@user/entities/user.entity';


@UseGuards( SecretAuthGuard( true ))
@Resolver(() => UserAttributeValue)
export class UserAttributeValuesResolver {
    constructor(private readonly userAttributeValuesService: UserAttributeValuesService) {}

    @Mutation( () => UserAttributeValue )
    createUserAttributeValue(
        @Args('createUserAttributeValueInput') createUserAttributeValueInput: CreateUserAttributeValueInput,
        @CurrentUser() currentUser: User
    ) {
        return this.userAttributeValuesService.create( createUserAttributeValueInput, currentUser );
    }

    @Query(() => [UserAttributeValue], { name: 'userAttributeValues' })
    findAll() {
        return this.userAttributeValuesService.findAll();
    }

    @Query(() => UserAttributeValue, { name: 'userAttributeValue' })
    findOne(@Args('id', { type: () => Int }) id: number) {
        return this.userAttributeValuesService.findOne(id);
    }

    @Mutation(() => UserAttributeValue)
    updateUserAttributeValue(@Args('updateUserAttributeValueInput') updateUserAttributeValueInput: UpdateUserAttributeValueInput) {
        return this.userAttributeValuesService.update(updateUserAttributeValueInput.id, updateUserAttributeValueInput);
    }

    @Mutation(() => UserAttributeValue)
    removeUserAttributeValue(@Args('id', { type: () => Int }) id: number) {
        return this.userAttributeValuesService.remove(id);
    }
}
