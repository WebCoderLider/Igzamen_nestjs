import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cors from 'cors';

async function bootstrap() {
  // Create a Nest application instance
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe to automatically validate incoming requests
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS
  app.use(cors());

  // Create Swagger API documentation
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Igzamen')
    .setDescription('This webcoder api')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);
  

  // Start the server and listen on port 3000
  await app.listen(3000);
}

bootstrap();
