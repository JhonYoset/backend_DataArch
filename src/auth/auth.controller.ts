import { Controller, Get, Post, UseGuards, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Initiates Google OAuth flow
    this.logger.log('Initiating Google OAuth flow');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      this.logger.log('Google OAuth callback received');
      this.logger.log(`User from request: ${JSON.stringify(req.user)}`);
      
      if (!req.user) {
        this.logger.error('No user found in request');
        return res.status(HttpStatus.UNAUTHORIZED).json({
          statusCode: 401,
          message: 'Authentication failed - no user data',
        });
      }

      const { access_token } = await this.authService.login(req.user);
      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
      
      this.logger.log(`Redirecting to frontend: ${frontendUrl}/auth/callback?token=${access_token.substring(0, 20)}...`);
      
      // Redirect to frontend with token
      res.redirect(`${frontendUrl}/auth/callback?token=${access_token}`);
    } catch (error) {
      this.logger.error(`Error in Google OAuth callback: ${error.message}`, error.stack);
      
      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
      res.redirect(`${frontendUrl}?error=auth_failed&message=${encodeURIComponent(error.message)}`);
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req) {
    this.logger.log(`Getting profile for user: ${req.user?.id}`);
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  logout(@Res() res) {
    this.logger.log('User logout');
    res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }
}