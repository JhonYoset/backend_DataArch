import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(profile: any): Promise<User> {
    const { id, emails, displayName, photos } = profile;
    const email = emails[0].value;
    
    let user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Create new user
      user = await this.usersService.create({
        email,
        googleId: id,
        fullName: displayName,
        avatarUrl: photos[0]?.value,
        role: email === 'jlunaq@unsa.edu.pe' ? UserRole.ADMIN : UserRole.MEMBER,
      });
    } else if (!user.googleId) {
      // Update existing user with Google ID
      user = await this.usersService.update(user.id, {
        googleId: id,
        avatarUrl: photos[0]?.value,
      });
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

  async validateUser(payload: any): Promise<User> {
    return this.usersService.findById(payload.sub);
  }
}