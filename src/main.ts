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
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn', 'log'] 
        : ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }));
    
    app.use(compression());

    // Rate limiting - más permisivo para desarrollo
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Más requests en desarrollo
      message: {
        error: 'Too many requests',
        message: 'Please try again later',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use(limiter);

    // CORS configuration - Configuración para desarrollo local
    const allowedOrigins = [
      // Desarrollo local
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
      
      // Vercel URLs de producción (para cuando despliegues)
      'https://frontend-data-arch.vercel.app',
      'https://frontend-data-arch-git-main-jhons-projects-50de0cd5.vercel.app',
      'https://frontend-data-arch-jhons-projects-50de0cd5.vercel.app',
      
      // URL del frontend desde variable de entorno
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    logger.log(`🌐 CORS origins configured: ${allowedOrigins.join(', ')}`);

    app.use(
      cors({
        origin: (origin, callback) => {
          // Permitir requests sin origin (como Postman, curl, etc.)
          if (!origin) return callback(null, true);
          
          // Verificar si el origin está en la lista permitida
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          
          // En desarrollo, ser más permisivo
          if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
          }
          
          logger.warn(`❌ CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Content-Type', 
          'Authorization', 
          'X-Requested-With',
          'Accept',
          'Origin',
        ],
        exposedHeaders: ['X-Total-Count'],
        maxAge: 86400, // 24 horas
      }),
    );

    // Global prefix para todas las rutas
    app.setGlobalPrefix('api');

    // Global validation pipe con configuración optimizada
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        disableErrorMessages: process.env.NODE_ENV === 'production',
      }),
    );

    // Swagger documentation - Habilitado en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const config = new DocumentBuilder()
        .setTitle('Data Arch Labs API')
        .setDescription('API completa para el portal del grupo de investigación Data Arch Labs')
        .setVersion('2.0')
        .setContact(
          'Data Arch Labs',
          'https://dataarchlabs.com',
          'contact@dataarchlabs.com'
        )
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .addServer('http://localhost:3001', 'Desarrollo Local')
        .addServer('https://backend-data-arch.vercel.app', 'Producción Vercel')
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: 'Data Arch Labs API Documentation',
        customfavIcon: '/favicon.ico',
        customCss: '.swagger-ui .topbar { display: none }',
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
        },
      });
    }

    // Puerto configurado
    const port = process.env.PORT || 3001;
    
    await app.listen(port, '0.0.0.0');
    
    // Logs informativos
    logger.log(`🚀 Backend running on: http://localhost:${port}`);
    logger.log(`📚 API Health Check: http://localhost:${port}/api`);
    
    if (process.env.NODE_ENV === 'development') {
      logger.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
    }
    
    logger.log(`🔐 Google Client ID: ${process.env.GOOGLE_CLIENT_ID?.substring(0, 20)}...`);
    logger.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    logger.log(`🗄️ Database Host: ${process.env.DATABASE_HOST}`);
    logger.log(`⚙️ Environment: ${process.env.NODE_ENV}`);
    
    // Verificar configuración de base de datos
    if (process.env.DATABASE_HOST && process.env.DATABASE_NAME) {
      logger.log(`✅ Database configuration loaded`);
    } else {
      logger.error(`❌ Database configuration incomplete`);
    }

  } catch (error) {
    logger.error(`❌ Error starting application: ${error.message}`, error.stack);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error(`Uncaught Exception: ${error.message}`, error.stack);
  process.exit(1);
});

// Manejo de señales para shutdown graceful
process.on('SIGTERM', () => {
  const logger = new Logger('SIGTERM');
  logger.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  const logger = new Logger('SIGINT');
  logger.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

bootstrap();