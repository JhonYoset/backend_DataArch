import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('team_members')
export class TeamMember {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  role: string;

  @ApiProperty()
  @Column('text')
  bio: string;

  @ApiProperty()
  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @ApiProperty()
  @Column('text', { array: true, default: '{}', name: 'research_areas' })
  researchAreas: string[];

  @ApiProperty()
  @Column({ name: 'github_url', nullable: true })
  githubUrl: string;

  @ApiProperty()
  @Column({ name: 'linkedin_url', nullable: true })
  linkedinUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  email: string;

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}