import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create event (Admin only)' })
  create(@Body() createEventDto: any, @Req() req) {
    return this.eventsService.create(createEventDto, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'upcoming', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false, enum: ['meeting', 'deadline', 'conference', 'other'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('upcoming') upcoming?: boolean,
    @Query('type') type?: 'meeting' | 'deadline' | 'conference' | 'other',
    @Query('limit') limit?: number,
  ) {
    if (upcoming) {
      return this.eventsService.findUpcoming(limit ? Number(limit) : undefined);
    }
    if (type) {
      return this.eventsService.findByType(type);
    }
    return this.eventsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event (Admin only)' })
  update(@Param('id') id: string, @Body() updateEventDto: any) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event (Admin only)' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}