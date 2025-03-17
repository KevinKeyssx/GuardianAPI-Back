import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/singup.dto';
import { AuthGuard } from './guards/auth.guard';


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


    @Get( 'validate' )
    @UseGuards( AuthGuard )
    revalidateToken() {
        return '';
    }
}
