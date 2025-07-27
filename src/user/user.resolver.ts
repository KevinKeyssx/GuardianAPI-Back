import {
    Resolver,
    Query,
    Mutation,
    Args,
    ID,
    ResolveField,
    Parent,
    Context
}                                   from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtService }               from '@nestjs/jwt';

// import Redis from 'ioredis';

import { SecretAuthGuard }      from '@auth/guards/jwt-auth.guard';
import { CurrentUser }          from '@auth/decorators/current-user.decorator';
import { hideUserMiddleware }   from '@config/hideIfNotApi';
import { SearchArgs }           from '@common/dto/args/search.args';
import { AttributesArgs }       from '@common/dto/args/attributes.args';
import { PaginationArgs }       from '@common/dto/args/pagination.args';
import { UserService }          from '@user/user.service';
import { UpdateUserInput }      from '@user/dto/update-user.input';
import { User }                 from '@user/entities/user.entity';
import { UserResponse }         from '@user/entities/user-response.';
import { Role }                 from '@roles/entities/role.entity';
import { RolesService }         from '@roles/roles.service';
import { UserAttributeService } from '@user-attribute/user-attribute.service';
import { UserAttribute }        from '@user-attribute/entities/user-attribute.entity';
import { ValidateUser }         from '@user/entities/validate-user';
import { ValidateTokenArgs }    from '@user/dto/validate-token.args';
import { CreateUserInput }      from '@user/dto/create-user.input';

import { GraphQLUpload, FileUpload } from 'graphql-upload-minimal';

@Resolver( () => UserResponse )
export class UserResolver {

    constructor(
        private readonly userService            : UserService,
        private readonly rolesService           : RolesService,
        private readonly userAttributeService   : UserAttributeService,
        private readonly jwtService: JwtService,

        // @Inject('REDIS') private readonly redis: Redis
    ) {}


    @UseGuards( SecretAuthGuard( true ))
    @Mutation( () => UserResponse )
    createUser(
        @Args( 'createUserInput' ) createUserInput: CreateUserInput,
        @CurrentUser() currentUser: User,
        @Args({ name: 'file', type: () => GraphQLUpload, nullable: true }) file?: FileUpload,
    ) {
        return this.userService.create( createUserInput, currentUser, file );
    }


    @UseGuards( SecretAuthGuard( false ))
    @Query(() => [UserResponse], { name: 'users' })
    findAll(
        @CurrentUser() user : User,
        @Args() search      : SearchArgs,
        @Args() pagination  : PaginationArgs
    ) {
        return this.userService.findAll( user, pagination, search );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Query(() => UserResponse, { name: 'user' })
    findOne(
        @CurrentUser() user: User,
        // @Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
        @Context() context: any,
        // @Args('id', { type: () => ID, nullable: true }, ParseUUIDPipe) id?: string,
        @Args('id', { type: () => ID, nullable: true }) id?: string,
    ) {
        context.userId = id ?? user.id;
        return this.userService.findOne( user, id ?? user.id );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Mutation( () => UserResponse )
    updateUser(
        @CurrentUser() user: User,
        @Args( 'updateUserInput' ) updateUserInput: UpdateUserInput,
        @Args({ name: 'file', type: () => GraphQLUpload, nullable: true }) file?: FileUpload,
    ) {
        return this.userService.update( user, updateUserInput, file );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Mutation( () => Boolean )
    removeUser(
        @CurrentUser() user: User,
        @Args( 'id', { type: () => ID, nullable: true }, ParseUUIDPipe ) id?: string
    ) {
        return this.userService.remove( user, id ?? user.id );
    }

    /**
     * ResolveFields
     * @param user
     * @param search
     * @param pagination
     * @returns
     * */
    @ResolveField( () => [Role], {
        name        : 'roles',
        middleware  : [ hideUserMiddleware ]
    })
    getRolesByUser(
        @Parent() user      : User,
        @Args() search      : SearchArgs,
        @Args() pagination  : PaginationArgs
    ) {
        return this.rolesService.findAll( user, pagination, search );
    }


    @ResolveField( () => [UserAttribute], { name: 'attributes' })
    getAttributes(
        @Parent() user      : User,
        // @CurrentUser() user: User,
        // @Context() context  : any,
        @Args() attributes  : AttributesArgs
    ) {
        return this.userAttributeService.findByKeys( user.id, attributes );
    }


    @UseGuards( SecretAuthGuard( true ))
    @Query(() => ValidateUser, { name: 'validateToken' })
    async validateToken(
        @CurrentUser() currentUser: User,
        @Context() context: any,
        @Args() args: ValidateTokenArgs
    ): Promise<ValidateUser> {
        // const isRevoked = await this.redis.get(`revoked:${token}`);

        // if ( isRevoked ) {
        //     return {
        //         valid       : false,
        //         user        : undefined,
        //         message     : 'Token has been revoked',
        //         errorCode   : 'TOKEN_REVOKED',
        //     };
        // }

        const payload = this.jwtService.verify( args.token );

        if ( !payload.id ) {
            return {
                valid       : false,
                user        : undefined,
                token       : undefined,
                message     : 'Invalid token payload',
                errorCode   : 'INVALID_PAYLOAD',
            };
        }

        context.userId = currentUser.id;

        const user = await this.userService.findOne( currentUser, currentUser.id);

        let responseToken = args.token;

        if ( args.refresh ) {
            // const expiresIn = payload.exp - Math.floor(Date.now() / 1000); // Segundos restantes
            // if ( expiresIn > 0 ) {
            //     await this.redis.set(`revoked:${args.token}`, 'true', 'EX', expiresIn);
            // }

            responseToken = this.#getJwtToken(user.id);
        }

        return {
            valid       : true,
            user        : user,
            token       : responseToken,
            message     : args.refresh ? 'Token refreshed successfully' : 'Token is valid',
            errorCode   : undefined,
        };
    }

    #getJwtToken( userId: string ) {
        return this.jwtService.sign({ id: userId }, { expiresIn: '4h' });
    }

}
