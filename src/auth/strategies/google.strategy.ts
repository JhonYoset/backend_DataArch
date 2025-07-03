import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
    
    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: '/api/auth/google/callback',
      scope: ['email', 'profile'],
    });

    this.logger.log('Google Strategy initialized');
    this.logger.log(`Client ID: ${clientID.substring(0, 10)}...`);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      this.logger.log(`Validating Google profile: ${profile.id}`);
      this.logger.log(`Profile data: ${JSON.stringify({
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails,
        photos: profile.photos
      })}`);

      const user = await this.authService.validateGoogleUser(profile);
      this.logger.log(`User validation successful: ${user.id}`);
      
      done(null, user);
    } catch (error) {
      this.logger.error(`Error validating Google user: ${error.message}`, error.stack);
      done(error, null);
    }
  }
}