import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { AuthService }  from '@auth/auth.service';
import { SignUpDto }    from '@auth/dto/signup.dto';
import { AuthGuard }    from '@auth/guards/auth.guard';
import { CurrentUser }  from '@auth/decorators/current-user.decorator';
import { User }         from '@user/entities/user.entity';
import { SocialSigninDto } from './dto/social-signin.dto';


@Controller( 'auth' )
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}


    @Post( 'sign-up' )
    signUp(
        @Body() signUpDto: SignUpDto
    ) {
        return this.authService.signUp( signUpDto );
    }

    @HttpCode( HttpStatus.OK )
    @Post( 'sign-in' )
    signIn(
        @Body() signUpDto: SignUpDto
    ) {
        return this.authService.signIn( signUpDto );
    }


    @Get( 'revalidate' )
    @UseGuards( AuthGuard )
    revalidateToken(
        @CurrentUser() user: User
    ) {
        return this.authService.revalidateToken( user );
    }


    @Post('social-login')
    async socialLogin(
        @Body() socialSigninDto: SocialSigninDto
    ) {
        return this.authService.signInSocial( socialSigninDto );
    }
}
