import { Controller, Get } from '@nestjs/common';


@Controller()
export class AppController {

    @Get()
    getHello(): string {
        return 'Welcome to Guardian API powered by KevinKeyssx 🚀 https://github.com/KevinKeyssx/GuardianAPI-Back';
    }

}
