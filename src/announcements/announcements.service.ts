import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, userId: string): Promise<Announcement> {
    const announcement = this.announcementsRepository.create({
      ...createAnnouncementDto,
      createdBy: userId,
    });
    return this.announcementsRepository.save(announcement);
  }

  async findAll(): Promise<Announcement[]> {
    return this.announcementsRepository.find({
      relations: ['creator'],
      order: { date: 'DESC' },
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

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto): Promise<Announcement> {
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
      order: { date: 'DESC' },
      take: limit,
    });
  }

  async searchByTitle(searchTerm: string): Promise<Announcement[]> {
    return this.announcementsRepository
      .createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.creator', 'creator')
      .where('announcement.title ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('announcement.content ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orderBy('announcement.date', 'DESC')
      .getMany();
  }
}