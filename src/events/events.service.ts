import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Event, EventType } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
    const event = this.eventsRepository.create({
      ...createEventDto,
      createdBy: userId,
    });
    return this.eventsRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({
      relations: ['creator'],
      order: { date: 'ASC' },
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

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    await this.eventsRepository.update(id, updateEventDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async findUpcoming(): Promise<Event[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.eventsRepository.find({
      where: { date: MoreThanOrEqual(today) },
      relations: ['creator'],
      order: { date: 'ASC' },
    });
  }

  async findByType(type: string): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { type: type as EventType },
      relations: ['creator'],
      order: { date: 'ASC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .where('event.date >= :startDate', { startDate })
      .andWhere('event.date <= :endDate', { endDate })
      .orderBy('event.date', 'ASC')
      .getMany();
  }

  async getEventStats(): Promise<any> {
    const total = await this.eventsRepository.count();
    const upcoming = await this.eventsRepository.count({
      where: { date: MoreThanOrEqual(new Date()) },
    });
    const meetings = await this.eventsRepository.count({ where: { type: EventType.MEETING } });
    const deadlines = await this.eventsRepository.count({ where: { type: EventType.DEADLINE } });
    const conferences = await this.eventsRepository.count({ where: { type: EventType.CONFERENCE } });

    return {
      total,
      upcoming,
      meetings,
      deadlines,
      conferences,
    };
  }
}