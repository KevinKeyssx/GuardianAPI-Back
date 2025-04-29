import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Req, BadRequestException } from '@nestjs/common';

import { AuthService }      from '@auth/auth.service';
import { SignUpDto }        from '@auth/dto/signup.dto';
import { AuthGuard }        from '@auth/guards/auth.guard';
import { CurrentUser }      from '@auth/decorators/current-user.decorator';
import { User }             from '@user/entities/user.entity';
import { SignInDto }        from '@auth/dto/signin.dto';
import { SocialSigninDto }  from '@auth/dto/social-signin.dto';


@Controller( 'auth' )
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}


    @HttpCode( HttpStatus.OK )
    @Post( 'sign-up' )
    signUp(
        @Body() signUpDto: SignUpDto
    ) {
        return this.authService.signUp( signUpDto );
    }


    @HttpCode( HttpStatus.OK )
    @Post( 'sign-in' )
    signIn(
        @Body() signInDto: SignInDto
    ) {
        return this.authService.signIn( signInDto );
    }


    @HttpCode( HttpStatus.OK )
    @Get( 'revalidate' )
    @UseGuards( AuthGuard )
    revalidateToken(
        @CurrentUser() user: User
    ) {
        return this.authService.revalidateToken( user );
    }


    @HttpCode( HttpStatus.OK )
    @Post( 'social-login' )
    async socialLogin(
        @Body() socialSigninDto: SocialSigninDto
    ) {
        return this.authService.signInSocial( socialSigninDto );
    }


    @HttpCode( HttpStatus.OK )
    @Post('logout')
    @UseGuards( AuthGuard )
    async logout(
        @Req() request: Request
    ) {
        const token = request['token'];

        await this.authService.logout(token);

        return { message: 'Logged out successfully' };
    }

}
