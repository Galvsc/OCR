import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginService {
    constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,) 
    {}
    
    // Hash password before storing it in the database
    async hashPassword(password: string): Promise<string> {
        
        const salt = await bcrypt.genSalt(); 
        return bcrypt.hash(password, salt);   
        }

     // Compare plain text password with the hashed one
    async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword); 
        }

    // Add user and hasdhed password to database
    async createUser(username: string, password: string) {
        const hashedPassword = await this.hashPassword(password);

        return this.databaseService.user.create({
        data: {
            username,
            password: hashedPassword, 
        },
        });
    }
  
    // Find user in database   
    async findUser(username: string) {
        const user = await this.databaseService.user.findUnique(
            {where: {
                username,
            }}
            )
    
        if (user){
            return user;
        }

        return null
    }

    // Validadate user password and return user to generate token
    async validateUser(username: string, password: string): Promise<any> {
        
        const user = await this.findUser(username);
    
        if (user && await this.validatePassword(password, user.password)) {
        const { password, ...result } = user;
        return result;}
        return null;
    }

    // Generate token to allow user navigation
    async generate_token(user: any) {
        const payload = { username: user.username, sub: user.user_id };
                  return {
                access_token: this.jwtService.sign(payload),
                user_id: user.user_id,
              }
        };s
}
