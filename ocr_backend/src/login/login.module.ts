import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,  
      signOptions: { expiresIn: '60m' },  
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService]
})
export class LoginModule {}
