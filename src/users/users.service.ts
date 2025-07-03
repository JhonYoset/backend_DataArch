import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    try {
      this.logger.log(`Creating user with data: ${JSON.stringify(userData)}`);
      
      const user = this.usersRepository.create(userData);
      const savedUser = await this.usersRepository.save(user);
      
      this.logger.log(`User created successfully: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      this.logger.log(`Finding user by email: ${email}`);
      const user = await this.usersRepository.findOne({ where: { email } });
      this.logger.log(`User found by email: ${user ? user.id : 'not found'}`);
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      this.logger.log(`Finding user by Google ID: ${googleId}`);
      const user = await this.usersRepository.findOne({ where: { googleId } });
      this.logger.log(`User found by Google ID: ${user ? user.id : 'not found'}`);
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by Google ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    try {
      this.logger.log(`Updating user ${id} with data: ${JSON.stringify(updateData)}`);
      
      await this.usersRepository.update(id, updateData);
      const updatedUser = await this.findOne(id);
      
      this.logger.log(`User updated successfully: ${updatedUser.id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}