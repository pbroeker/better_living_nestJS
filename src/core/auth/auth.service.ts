import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}
  getHello(): string {
    const host = this.configService.get<string>('user');
    return `Hello, howsewst is: ${host}`;
  }
}
