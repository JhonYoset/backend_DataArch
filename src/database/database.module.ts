import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { TeamMember } from '../team-members/entities/team-member.entity';
import { Project } from '../projects/entities/project.entity';
import { Announcement } from '../announcements/entities/announcement.entity';
import { Event } from '../events/entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        host: configService.get('DATABASE_HOST'),
        port: parseInt(configService.get('DATABASE_PORT')) || 5432,
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [User, TeamMember, Project, Announcement, Event],
        synchronize: true, // Cambiado a true temporalmente para crear las tablas
        ssl: configService.get('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
        logging: configService.get('NODE_ENV') === 'development' ? ['error', 'warn'] : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}