import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('events')
export class Event {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column('text')
  description: string;

  @ApiProperty()
  @Column({ type: 'date' })
  date: string;

  @ApiProperty()
  @Column({ type: 'time', default: '09:00:00' })
  time: string;

  @ApiProperty()
  @Column({ nullable: true })
  location: string;

  @ApiProperty({ enum: ['meeting', 'deadline', 'conference', 'other'] })
  @Column({ type: 'enum', enum: ['meeting', 'deadline', 'conference', 'other'], default: 'other' })
  type: 'meeting' | 'deadline' | 'conference' | 'other';

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