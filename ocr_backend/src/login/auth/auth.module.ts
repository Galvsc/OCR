import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SafeGuard } from './auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET,  
    signOptions: { expiresIn: '60m' },  
  }),
],
  providers: [AuthService, SafeGuard],
  controllers: [AuthController]
})  
export class AuthModule {}
