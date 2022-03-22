import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SharedAuthService {
  constructor(private configService: ConfigService) {}

  async hashPassword(password: string): Promise<string> {
    const salt = parseInt(this.configService.get<string>('BCRYPT_SALT'));
    return await bcrypt.hash(password, salt);
  }
}
