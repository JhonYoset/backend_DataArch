import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { TeamMember } from '../team-members/entities/team-member.entity';
import { Project } from '../projects/entities/project.entity';
import { Announcement } from '../announcements/entities/announcement.entity';
import { Event } from '../events/entities/event.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const host = configService.get('DATABASE_HOST');
        const port = configService.get('DATABASE_PORT');
        const username = configService.get('DATABASE_USERNAME');
        const password = configService.get('DATABASE_PASSWORD');
        const database = configService.get('DATABASE_NAME');
        
        if (!host || !username || !password || !database) {
          throw new Error('Database configuration variables are missing. Please check your .env file.');
        }

        console.log(`🗄️ Connecting to PostgreSQL at ${host}:${port}/${database}`);
        
        return {
          type: 'postgres',
          host: host,
          port: parseInt(port) || 5432,
          username: username,
          password: password,
          database: database,
          entities: [User, TeamMember, Project, Announcement, Event],
          synchronize: true, // Crea automáticamente las tablas basadas en las entidades
          ssl: false, // Deshabilitado para desarrollo local
          extra: {
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
          },
          logging: configService.get('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, TeamMember, Project, Announcement, Event]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}