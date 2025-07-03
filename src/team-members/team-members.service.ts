import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectRepository(TeamMember)
    private teamMembersRepository: Repository<TeamMember>,
  ) {}

  async create(createTeamMemberDto: Partial<TeamMember>): Promise<TeamMember> {
    const teamMember = this.teamMembersRepository.create(createTeamMemberDto);
    return this.teamMembersRepository.save(teamMember);
  }

  async findAll(): Promise<TeamMember[]> {
    return this.teamMembersRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<TeamMember> {
    const teamMember = await this.teamMembersRepository.findOne({ 
      where: { id } 
    });
    if (!teamMember) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    return teamMember;
  }

  async update(id: string, updateTeamMemberDto: Partial<TeamMember>): Promise<TeamMember> {
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