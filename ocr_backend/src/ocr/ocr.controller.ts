import { Controller, Get, Post, UseInterceptors, UploadedFile, Body, Query, Res, 
  ParseFilePipe, FileTypeValidator, UseGuards } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { SafeGuard } from 'src/login/auth/auth.guard';

@Controller('ocr')
export class OcrController {
    constructor(private readonly ocrService:OcrService) {}

    //Upload file to database and extract text  
    @UseGuards(SafeGuard)
    @Post('upload')
    @UseInterceptors(
      FileInterceptor('file'))  
      async uploadFile(@Body('user_id') user_id: number, @UploadedFile(
          new ParseFilePipe({
              validators: [
                new FileTypeValidator({ fileType: /(image\/jpeg|image\/png)/ }), 
              ]
          }),
        )  file: Express.Multer.File) {
        
        const text = await this.ocrService.extractTextFromImage(file.buffer);
        const filename = file.originalname;

        const data = await this.ocrService.create({user_id: +user_id,  
          filename : filename,
          extractedText : text,
          extractStatus: true})


        const index = filename.lastIndexOf('.');
        const ext = filename.substring(index + 1);
        this.ocrService.upload(`${data.file_id.toString()}.${ext}`, file.buffer)  
        console.log(`Successful upload. User: ${user_id}`)

        return { extractedText: text };
        }
    
    //Fetch the user files    
    @UseGuards(SafeGuard)    
    @Get('list')
      async getList(@Query('user_id') user_id: number){
        return this.ocrService.getList(+user_id)
      }


    //Fetch the uploaded file text
    @UseGuards(SafeGuard)
    @Get('text')
      async getText(@Query('file_id') file_id: number, @Query('user_id') user_id: number) {
        const file = await this.ocrService.getData(+file_id);

        if (!file){
          return "File not found"
        }

        if (file.user_id !== +user_id){
          return "The user doesn't own this file"
        }

        return { extractedText: file.extractedText};
      }
    
    //Download pdf with image and extracted text 
    @UseGuards(SafeGuard)    
    @Get('download')
      async getFile(@Res() res: Response, @Query('file_id') file_id : number, @Query('user_id') user_id: number){
        const file = await this.ocrService.getData(+file_id)

      if (!file){
        return "File not found"
      }

      if (file.user_id !== +user_id){
        return "The user doesn't own this file"
      }
      
      try{
        const text = file.extractedText
        const filename = file.filename;
        const index = filename.lastIndexOf('.');
        const ext = filename.substring(index + 1);
        const key = `${file_id.toString()}.${ext}`;
        const url = await this.ocrService.getPreSignedURLToViewObject(key)

        const pdfBuffer = await this.ocrService.getPdf(url, text)
        
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=output.pdf',
        });
        res.send(pdfBuffer);
      }
      catch (error){
        console.error('Error generating or sending PDF:', error);
        res.status(500).send('Error generating PDF');
      }
      }
    
      
    }
