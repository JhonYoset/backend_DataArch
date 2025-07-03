import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new announcement (Admin only)' })
  create(@Body() createAnnouncementDto: CreateAnnouncementDto, @CurrentUser() user: User) {
    return this.announcementsService.create(createAnnouncementDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all announcements' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title and content' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of results' })
  findAll(@Query('search') search?: string, @Query('limit') limit?: string) {
    if (search) {
      return this.announcementsService.searchByTitle(search);
    }
    if (limit) {
      return this.announcementsService.findRecent(parseInt(limit));
    }
    return this.announcementsService.findAll();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent announcements' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of recent announcements to fetch' })
  findRecent(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit) : 5;
    return this.announcementsService.findRecent(limitNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcement by ID' })
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update announcement (Admin only)' })
  update(@Param('id') id: string, @Body() updateAnnouncementDto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete announcement (Admin only)' })
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}