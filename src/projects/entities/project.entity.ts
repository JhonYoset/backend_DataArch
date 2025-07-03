import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('projects')
export class Project {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('text')
  description: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  content: string;

  @ApiProperty()
  @Column('text', { array: true, default: '{}' })
  images: string[];

  @ApiProperty()
  @Column('text', { array: true, default: '{}' })
  files: string[];

  @ApiProperty()
  @Column('text', { array: true, default: '{}', name: 'team_members' })
  teamMembers: string[];

  @ApiProperty({ enum: ['active', 'completed', 'on-hold'] })
  @Column({ type: 'enum', enum: ['active', 'completed', 'on-hold'], default: 'active' })
  status: 'active' | 'completed' | 'on-hold';

  @ApiProperty()
  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}