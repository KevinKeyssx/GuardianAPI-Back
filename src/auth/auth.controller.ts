import { Body, Controller, Get, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/singup.dto';


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

    @Post( 'sign-in' )
    signIn(
        @Body() signUpDto: SignUpDto
    ) {
        return this.authService.signIn( signUpDto );
    }
}
