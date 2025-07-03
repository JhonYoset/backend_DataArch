import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectRepository(TeamMember)
    private teamMembersRepository: Repository<TeamMember>,
  ) {}

  async create(createTeamMemberDto: CreateTeamMemberDto): Promise<TeamMember> {
    const teamMember = this.teamMembersRepository.create(createTeamMemberDto);
    return this.teamMembersRepository.save(teamMember);
  }

  async findAll(): Promise<TeamMember[]> {
    return this.teamMembersRepository.find({
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TeamMember> {
    const teamMember = await this.teamMembersRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!teamMember) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    
    return teamMember;
  }

  async update(id: string, updateTeamMemberDto: UpdateTeamMemberDto): Promise<TeamMember> {
    await this.teamMembersRepository.update(id, updateTeamMemberDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.teamMembersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
  }
}