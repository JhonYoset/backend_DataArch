import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const project = this.projectsRepository.create({
      name: createProjectDto.name,
      description: createProjectDto.description,
      content: createProjectDto.content || '',
      images: createProjectDto.images || [],
      files: createProjectDto.files || [],
      teamMembers: createProjectDto.teamMembers || [],
      status: createProjectDto.status || ProjectStatus.ACTIVE,
      createdBy: userId,
    });
    
    return this.projectsRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const updateData: any = {};
    
    if (updateProjectDto.name !== undefined) updateData.name = updateProjectDto.name;
    if (updateProjectDto.description !== undefined) updateData.description = updateProjectDto.description;
    if (updateProjectDto.content !== undefined) updateData.content = updateProjectDto.content;
    if (updateProjectDto.images !== undefined) updateData.images = updateProjectDto.images;
    if (updateProjectDto.files !== undefined) updateData.files = updateProjectDto.files;
    if (updateProjectDto.teamMembers !== undefined) updateData.teamMembers = updateProjectDto.teamMembers;
    if (updateProjectDto.status !== undefined) updateData.status = updateProjectDto.status;

    await this.projectsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async findByStatus(status: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { status: status as ProjectStatus },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async getProjectStats(): Promise<any> {
    const total = await this.projectsRepository.count();
    const active = await this.projectsRepository.count({ 
      where: { status: ProjectStatus.ACTIVE } 
    });
    const completed = await this.projectsRepository.count({ 
      where: { status: ProjectStatus.COMPLETED } 
    });
    const onHold = await this.projectsRepository.count({ 
      where: { status: ProjectStatus.ON_HOLD } 
    });

    return {
      total,
      active,
      completed,
      onHold,
    };
  }
}