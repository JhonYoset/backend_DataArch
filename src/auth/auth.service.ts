import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(profile: any): Promise<User> {
    const { id, emails, displayName, photos } = profile;
    const email = emails[0].value;
    const avatarUrl = photos[0]?.value;

    let user = await this.usersService.findByGoogleId(id);
    
    if (!user) {
      user = await this.usersService.findByEmail(email);
      if (user) {
        // Update existing user with Google ID
        user.googleId = id;
        user.avatarUrl = avatarUrl;
        user = await this.usersService.update(user.id, user);
      } else {
        // Create new user
        user = await this.usersService.create({
          email,
          googleId: id,
          fullName: displayName,
          avatarUrl,
          role: 'member',
        });
      }
    }

    return user;
  }

  async login(user: User) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}