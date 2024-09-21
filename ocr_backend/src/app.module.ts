import { Module } from '@nestjs/common';
import { AppService } from './app.service'; 
import { AppController } from './app.controller';
import { OcrService } from './ocr/ocr.service';
import { OcrModule } from './ocr/ocr.module';
import { DatabaseModule } from './database/database.module';
import { LoginService } from './login/login.service';
import { LoginModule } from './login/login.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AppController],
  providers: [AppService, OcrService, LoginService, JwtService],
  imports: [OcrModule, DatabaseModule, LoginModule, ConfigModule.forRoot({isGlobal: true})],
})
export class AppModule {}
