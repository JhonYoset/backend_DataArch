import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>,
  ) {}

  async create(createAnnouncementDto: Partial<Announcement>, userId?: string): Promise<Announcement> {
    const announcement = this.announcementsRepository.create({
      ...createAnnouncementDto,
      createdBy: userId,
    });
    return this.announcementsRepository.save(announcement);
  }

  async findAll(): Promise<Announcement[]> {
    return this.announcementsRepository.find({
      relations: ['creator'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Announcement> {
    const announcement = await this.announcementsRepository.findOne({ 
      where: { id },
      relations: ['creator'],
    });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return announcement;
  }

  async update(id: string, updateAnnouncementDto: Partial<Announcement>): Promise<Announcement> {
    await this.announcementsRepository.update(id, updateAnnouncementDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.announcementsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
  }

  async findRecent(limit: number = 5): Promise<Announcement[]> {
    return this.announcementsRepository.find({
      relations: ['creator'],
      order: { date: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }
}