import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(profile: any): Promise<User> {
    try {
      this.logger.log(`Validating Google user: ${JSON.stringify(profile)}`);
      
      const { id, emails, displayName, photos } = profile;
      
      if (!emails || !emails[0] || !emails[0].value) {
        throw new Error('No email found in Google profile');
      }
      
      const email = emails[0].value;
      const avatarUrl = photos && photos[0] ? photos[0].value : null;

      this.logger.log(`Looking for user with Google ID: ${id}`);
      let user = await this.usersService.findByGoogleId(id);
      
      if (!user) {
        this.logger.log(`User not found by Google ID, checking by email: ${email}`);
        user = await this.usersService.findByEmail(email);
        
        if (user) {
          // Update existing user with Google ID
          this.logger.log(`Updating existing user with Google ID`);
          user.googleId = id;
          if (avatarUrl) user.avatarUrl = avatarUrl;
          user = await this.usersService.update(user.id, {
            googleId: id,
            avatarUrl: avatarUrl,
          });
        } else {
          // Create new user
          this.logger.log(`Creating new user`);
          user = await this.usersService.create({
            email,
            googleId: id,
            fullName: displayName || email.split('@')[0],
            avatarUrl,
            role: 'member',
          });
        }
      } else {
        // Update avatar if needed
        if (avatarUrl && user.avatarUrl !== avatarUrl) {
          user = await this.usersService.update(user.id, {
            avatarUrl: avatarUrl,
          });
        }
      }

      this.logger.log(`User validated successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error validating Google user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(user: User) {
    try {
      this.logger.log(`Logging in user: ${user.id}`);
      
      const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role 
      };
      
      const access_token = this.jwtService.sign(payload);
      
      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      };
    } catch (error) {
      this.logger.error(`Error during login: ${error.message}`, error.stack);
      throw error;
    }
  }
}