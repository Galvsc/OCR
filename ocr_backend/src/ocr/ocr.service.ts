import { Injectable } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ConfigService } from '@nestjs/config';
import { GetObjectCommand, PutObjectCommand, S3, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import axios from 'axios';
import * as path from 'path';

@Injectable()
export class OcrService {
  private s3Client: S3Client;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService
  ) {  
    this.s3Client = new S3Client({
    region: this.configService.get<string>('AWS_S3_REGION'),
    credentials: {
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    },
  });
  }

  // Upload image to AWS server
  async upload(file_id: string, file: Buffer){
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: file_id,
        Body: file,
      })
    )
  }
  
  // Add file information to prisma database
  async create(file : Prisma.EventCreateInput) {
    return this.databaseService.event.create({
      data: file
    });
  }

  // Fetch user files in prisma database  
  async getList(user_id: number){
    return this.databaseService.event.findMany({
      where: {
        user_id,
      }
    })
  }

  // Get user file in prisma database
  async getData(file_id: number){
  const file = await this.databaseService.event.findUnique({
    where:{
        file_id,
  } })
  
    return file
  }

  // Get url to download image
  async getPreSignedURLToViewObject(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 300, // URL expiration time (in seconds)
      });
      return url;
    } catch (error) {
      throw error;
    }
  }

  // Call tesseract api to recognize text from image
  async extractTextFromImage(filebuffer: Buffer): Promise<string> {
    try {
      const result = await Tesseract.recognize(filebuffer, 'por', {
        logger: (m) => console.log(m),
      });
      return result.data.text;
    } catch (error) {
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  // Generate file in pdf
  async getPdf(imageUrl: string, text: string): Promise<Buffer> {

    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');
    const cleanUrl = imageUrl.split('?')[0];
    const ext = path.extname(cleanUrl).toLowerCase();

   
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    let embeddedImage;
    if (ext === '.jpg' || ext === '.jpeg') {
      embeddedImage = await pdfDoc.embedJpg(imageBuffer);
    } else if (ext === '.png') {
      embeddedImage = await pdfDoc.embedPng(imageBuffer);
    } else {
      throw new Error('Unsupported image type');
    }

    const imageHeight = height / 2;
    const textYStart = height - imageHeight - 24; 

    page.drawImage(embeddedImage, {
      x: 0,
      y: height - imageHeight,
      width: width,
      height: imageHeight,
    });

    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    page.drawText('Extracted Text', {
      x: width/2-75, // TODO center text
      y: textYStart - 24, 
      size: 24,
      color: rgb(0, 0, 0),
      font: font
    });
   
    await this.addTextWithPagination(pdfDoc, text, width, textYStart - 36, font);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
  
  // Handle pagination for PDF
  private async addTextWithPagination(pdfDoc: PDFDocument, text: string, pageWidth: number, startY: number, font: any) {
    const pageHeight = pdfDoc.getPage(0).getHeight();
    let remainingText = text.replace(/\n/g, ' \n ');
    let currentPage = pdfDoc.getPage(0);
    let y = startY;

    while (remainingText.length > 0) {
      
        const textSize = 12;
        const textWidth = pageWidth - 100;
        const lines: string[] = [];
        let currentLine = '';
        const lineBreak = '\n';

        for (const word of remainingText.split(' ')) {
          
            const testLine = currentLine ? `${currentLine} ${word}` : word;

            if (word === lineBreak){
              lines.push(currentLine);
              currentLine = '';
            }else{

             const width = await font.widthOfTextAtSize(testLine, textSize);

            if (width < textWidth) {
                currentLine = testLine;
            } else {
                lines.push(`${currentLine}\n`);
                currentLine = word;
            }}}
        lines.push(currentLine);

        for (const line of lines) {
            const lineParts = line.split(lineBreak);
            for (const part of lineParts) {
              
              if (y < 50) {
                currentPage = pdfDoc.addPage();
                y = pageHeight - 50; 
            }
  
              currentPage.drawText(part, {
                    x: 50,
                    y: y,
                    size: textSize,
                    color: rgb(0, 0, 0),
                    font: font
                });
                y -= textSize + 4; 
            }
        }

      remainingText = ''; 
    }
  } 
}
