import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedAuthService } from '../../shared/shared-auth.service';

@Injectable()
export class UserService {
  constructor(
    private sharedAuthServiceService: SharedAuthService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(userEmail: string, userPassword: string): Promise<User> {
    const decodedPassword = Buffer.from(userPassword, 'base64').toString();
    const pwHash = await this.sharedAuthServiceService.hashPassword(
      decodedPassword,
    );
    const userEntity = this.userRepository.create({
      user_email: userEmail,
      user_password: pwHash,
    });

    return await this.userRepository.save(userEntity);
  }
}
