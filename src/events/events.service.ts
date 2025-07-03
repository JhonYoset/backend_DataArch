import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async create(createEventDto: Partial<Event>, userId?: string): Promise<Event> {
    const event = this.eventsRepository.create({
      ...createEventDto,
      createdBy: userId,
    });
    return this.eventsRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({
      relations: ['creator'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ 
      where: { id },
      relations: ['creator'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: Partial<Event>): Promise<Event> {
    await this.eventsRepository.update(id, updateEventDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async findUpcoming(limit?: number): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const queryBuilder = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .where('event.date >= :today', { today })
      .orderBy('event.date', 'ASC')
      .addOrderBy('event.time', 'ASC');

    if (limit) {
      queryBuilder.take(limit);
    }

    return queryBuilder.getMany();
  }

  async findByType(type: 'meeting' | 'deadline' | 'conference' | 'other'): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { type },
      relations: ['creator'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }
}