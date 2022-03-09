import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}
  getHello(): string {
    const env = this.configService.get<string>('ENV_NAME');
    return `Hello, your environment is: ${env}`;
  }
}
