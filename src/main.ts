import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cors from 'cors';
import helmet from 'helmet';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  // CORS configuration
  const corsOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://frontend-data-arch.vercel.app',
    'https://frontend-data-arch-git-main-jhons-projects-50de0cd5.vercel.app',
    'https://frontend-data-arch-jhons-projects-50de0cd5.vercel.app',
    'https://frontend-data-arch-mhaksd7tl-jhons-projects-50de0cd5.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  logger.log(`CORS origins: ${corsOrigins.join(', ')}`);

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Data Arch Labs API')
    .setDescription('API for Data Arch Labs research group portal')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  logger.log(`🚀 Backend running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🔐 Google Client ID: ${process.env.GOOGLE_CLIENT_ID?.substring(0, 20)}...`);
  logger.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
}

bootstrap();