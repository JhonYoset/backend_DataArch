import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Data Arch Labs API is running! 🚀';
  }
}