import { Body, Controller, Post } from '@nestjs/common';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
    constructor(private readonly loginService: LoginService){}

    //Login
    @Post()
    async login(@Body("username") username: string, @Body("password") password: string) {
        const user = await this.loginService.validateUser(username, password);
     
        if (!user){
            return null
        }
        
        return this.loginService.generate_token(user)        
    }

    //Create user
    @Post("signup")
    async createUser(@Body("username") username: string, @Body("password") password: string){
        return this.loginService.createUser(username, password)
    }

}
