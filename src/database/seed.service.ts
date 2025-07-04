import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TeamMember } from '../team-members/entities/team-member.entity';
import { Project } from '../projects/entities/project.entity';
import { Announcement } from '../announcements/entities/announcement.entity';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(TeamMember)
    private teamMembersRepository: Repository<TeamMember>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async onModuleInit() {
    await this.seedDatabase();
  }

  private async seedDatabase() {
    try {
      this.logger.log('🌱 Starting database seed...');

      // Check if data already exists
      const userCount = await this.usersRepository.count();
      if (userCount > 0) {
        this.logger.log('✅ Database already contains data, skipping seed');
        
        // Update existing events that don't have time
        await this.updateExistingEvents();
        return;
      }

      // Create admin user
      await this.seedUsers();
      
      // Create team members
      await this.seedTeamMembers();
      
      // Create projects
      await this.seedProjects();
      
      // Create announcements
      await this.seedAnnouncements();
      
      // Create events
      await this.seedEvents();

      this.logger.log('🎉 Database seed completed successfully');
    } catch (error) {
      this.logger.error('❌ Error during database seed:', error);
    }
  }

  private async updateExistingEvents() {
    try {
      // Update events that don't have time defined
      const eventsWithoutTime = await this.eventsRepository
        .createQueryBuilder('event')
        .where('event.time IS NULL')
        .getMany();

      if (eventsWithoutTime.length > 0) {
        this.logger.log(`🔄 Updating ${eventsWithoutTime.length} events without time...`);
        
        for (const event of eventsWithoutTime) {
          await this.eventsRepository.update(event.id, { time: '09:00:00' });
        }
        
        this.logger.log('✅ Events updated successfully');
      }
    } catch (error) {
      this.logger.warn('⚠️ Error updating existing events:', error.message);
    }
  }

  private async seedUsers() {
    const adminUser = this.usersRepository.create({
      email: 'admin@dataarchlabs.com',
      googleId: 'admin-google-id-123',
      fullName: 'Data Arch Labs Administrator',
      role: 'admin',
      isActive: true,
    });

    await this.usersRepository.save(adminUser);
    this.logger.log('👤 Admin user created');
  }

  private async seedTeamMembers() {
    const teamMembers = [
      {
        name: 'Dr. María González',
        role: 'Research Director',
        bio: 'PhD in Computer Science with specialization in Artificial Intelligence and Sustainable Architecture. Leads research projects at the intersection of technology and architectural design.',
        researchAreas: ['Artificial Intelligence', 'Sustainable Architecture', 'Machine Learning', 'Computational Design'],
        email: 'maria.gonzalez@dataarchlabs.com',
        githubUrl: 'https://github.com/mariagonzalez',
        linkedinUrl: 'https://linkedin.com/in/maria-gonzalez-ai',
        avatarUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        name: 'Eng. Carlos Mendoza',
        role: 'Senior Full-Stack Developer',
        bio: 'Software Engineer specialized in full-stack development and process automation. Expert in modern web technologies and scalable architectures.',
        researchAreas: ['Web Development', 'Automation', 'DevOps', 'React', 'Node.js'],
        email: 'carlos.mendoza@dataarchlabs.com',
        githubUrl: 'https://github.com/carlosmendoza',
        linkedinUrl: 'https://linkedin.com/in/carlos-mendoza-dev',
        avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        name: 'Arch. Ana Rodríguez',
        role: 'Computational Design Specialist',
        bio: 'Architect with a Master\'s in Computational Design and experience in parametric modeling. Specialist in BIM tools and architectural visualization.',
        researchAreas: ['Computational Design', 'Parametric Modeling', 'BIM', '3D Visualization'],
        email: 'ana.rodriguez@dataarchlabs.com',
        githubUrl: 'https://github.com/anarodriguez',
        linkedinUrl: 'https://linkedin.com/in/ana-rodriguez-arch',
        avatarUrl: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        name: 'Dr. Luis Fernández',
        role: 'Data Science Researcher',
        bio: 'PhD in Applied Mathematics specialized in data analysis and statistics. Develops algorithms for pattern analysis in architectural design.',
        researchAreas: ['Data Science', 'Statistics', 'Python', 'Predictive Analysis'],
        email: 'luis.fernandez@dataarchlabs.com',
        githubUrl: 'https://github.com/luisfernandez',
        linkedinUrl: 'https://linkedin.com/in/luis-fernandez-data',
        avatarUrl: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    ];

    for (const memberData of teamMembers) {
      const member = this.teamMembersRepository.create(memberData);
      await this.teamMembersRepository.save(member);
    }

    this.logger.log('👥 Team members created');
  }

  private async seedProjects() {
    const projects = [
      {
        name: 'AI-Powered Sustainable Design',
        description: 'Development of AI tools to optimize sustainable architectural design through predictive analysis and machine learning.',
        content: `This project seeks to revolutionize architectural design through the implementation of artificial intelligence algorithms that can predict and optimize the energy performance of buildings from the early stages of design.

Main objectives:
- Develop ML models for energy efficiency prediction
- Create AI-assisted design tools
- Integrate real-time climate analysis
- Optimize materials and construction systems

Methodology:
1. Data collection from existing buildings
2. Training of predictive models
3. Development of intuitive user interface
4. Validation with real case studies

Expected results:
- 30% reduction in energy consumption
- Improvement in design decision making
- Accessible tools for architects`,
        status: 'active' as const,
        images: [
          'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        teamMembers: [],
      },
      {
        name: 'Automated Building Analysis Platform',
        description: 'Automated system for comprehensive analysis of energy efficiency and sustainability in existing buildings.',
        content: `Web platform that automates the process of analyzing existing buildings, providing detailed reports on energy efficiency, sustainability and improvement recommendations.

Main features:
- Automated analysis of architectural plans
- Integration with IoT sensors
- Automatic efficiency reports
- Interactive dashboard for monitoring

Technologies used:
- React.js for frontend
- Node.js and NestJS for backend
- PostgreSQL for data storage
- Python for analysis algorithms
- Climate services APIs

Expected impact:
- 80% reduction in analysis time
- Greater precision in evaluations
- Democratization of access to professional analysis`,
        status: 'active' as const,
        images: [
          'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        teamMembers: [],
      },
      {
        name: 'Data Visualization Platform',
        description: 'Interactive web platform for visualization and analysis of architectural and urban research data.',
        content: `Complete tool for visualizing complex data related to architectural research, allowing researchers and professionals to explore patterns and trends intuitively.

Implemented functionalities:
- Interactive visualizations with D3.js
- Integrated geospatial maps
- Temporal data analysis
- Custom report export
- Real-time collaboration

Use cases:
- Urban pattern analysis
- Climate data visualization
- Construction project tracking
- Energy efficiency comparison

Current status:
The project has been successfully completed and is being used by several research groups. More than 10,000 datasets have been processed and hundreds of visualizations generated.`,
        status: 'completed' as const,
        images: [
          'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        teamMembers: [],
      },
    ];

    for (const projectData of projects) {
      const project = this.projectsRepository.create(projectData);
      await this.projectsRepository.save(project);
    }

    this.logger.log('📁 Projects created');
  }

  private async seedAnnouncements() {
    const announcements = [
      {
        title: 'Welcome to Data Arch Labs',
        content: `We are pleased to announce the official launch of our Data Arch Labs research portal. This digital space will be the center of our research, collaboration and scientific dissemination activities.

In this portal you will find:
- Detailed information about our research projects
- Complete profiles of our multidisciplinary team
- Event announcements, conferences and opportunities
- Resources and scientific publications
- Collaboration tools for the community

Our goal is to create a bridge between academic research and practical application in the field of architecture and computational design. We invite the entire community to explore our work and join our initiatives.

We hope this portal will be a valuable tool for advancing knowledge in our field!`,
        date: new Date().toISOString().split('T')[0],
        links: ['https://dataarchlabs.com', 'https://github.com/dataarchlabs'],
      },
      {
        title: 'New International Collaboration with MIT',
        content: `We are excited to announce a new collaboration with the Massachusetts Institute of Technology (MIT) for the joint development of projects in the area of Artificial Intelligence applied to sustainable architecture.

This collaboration includes:
- Exchange of researchers and students
- Joint development of AI tools
- Collaborative scientific publications
- Access to specialized laboratories
- Joint funding for innovative projects

The first joint project will focus on developing machine learning algorithms for automatic optimization of architectural designs considering climatic factors, energy efficiency and sustainability.

This strategic alliance strengthens our position as a reference in applied research and allows us access to world-class resources for the development of our projects.`,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        links: ['https://mit.edu', 'https://architecture.mit.edu'],
      },
    ];

    for (const announcementData of announcements) {
      const announcement = this.announcementsRepository.create(announcementData);
      await this.announcementsRepository.save(announcement);
    }

    this.logger.log('📢 Announcements created');
  }

  private async seedEvents() {
    const events = [
      {
        title: 'Weekly Team Meeting',
        description: `Weekly meeting to review the progress of active projects, discuss technical challenges and plan activities for the next week.

Agenda:
- Progress report by project
- Discussion of technical problems
- Weekly task planning
- Resource coordination
- General announcements

All team members must attend. Coffee and snacks will be provided.`,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:00:00',
        location: 'Conference Room A - Research Building',
        type: 'meeting' as const,
      },
      {
        title: 'Workshop: Introduction to Machine Learning for Architects',
        description: `Practical workshop aimed at architects and designers interested in learning the fundamentals of machine learning and its application in architectural design.

Workshop content:
- Basic ML concepts
- Popular tools and libraries
- Use cases in architecture
- Practical exercises with real data
- Development of a simple model

Aimed at: Architects, designers, architecture students
Level: Beginner
Duration: 4 hours
Includes: Educational material, certificate of participation

Requirements: Personal laptop, basic programming knowledge (desirable)`,
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:00:00',
        location: 'Computer Lab - University Campus',
        type: 'other' as const,
      },
      {
        title: 'International Conference: AI in Architecture 2025',
        description: `Participation as keynote speakers at the international conference on Artificial Intelligence applied to architecture, where we will present our latest research advances.

Data Arch Labs presentations:
- "Automatic optimization of sustainable designs" - Dr. María González
- "Automated analysis platforms" - Eng. Carlos Mendoza
- "Architectural data visualization" - Dr. Luis Fernández

The conference will bring together more than 500 researchers, architects and technologists from around the world to discuss the latest trends and advances in the field.

Modality: In-person and virtual
Language: English with simultaneous translation
Registration: Required in advance`,
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '09:00:00',
        location: 'International Convention Center - Barcelona, Spain',
        type: 'conference' as const,
      },
    ];

    for (const eventData of events) {
      const event = this.eventsRepository.create(eventData);
      await this.eventsRepository.save(event);
    }

    this.logger.log('📅 Events created');
  }
}