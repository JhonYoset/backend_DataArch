import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EventType {
  MEETING = 'meeting',
  DEADLINE = 'deadline',
  CONFERENCE = 'conference',
  OTHER = 'other',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  time: string;

  @Column({ nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.OTHER,
  })
  type: EventType;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}