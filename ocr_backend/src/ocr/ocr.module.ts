import { Module } from '@nestjs/common';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/login/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { SafeGuard } from 'src/login/auth/auth.guard';
import { AuthService } from 'src/login/auth/auth.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [OcrController],
  providers: [OcrService, SafeGuard, AuthService, JwtService]
})
export class OcrModule {}
