import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreUser } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedAuthService } from '../../shared/shared-auth.service';

@Injectable()
export class UserService {
  constructor(
    private sharedAuthServiceService: SharedAuthService,
    @InjectRepository(CoreUser)
    private userRepository: Repository<CoreUser>,
  ) {}

  async createUser(userEmail: string, userPassword: string): Promise<CoreUser> {
    try {
      const decodedPassword = Buffer.from(userPassword, 'base64').toString();
      const pwHash = await this.sharedAuthServiceService.hashPassword(
        decodedPassword,
      );
      const userEntity = this.userRepository.create({
        user_email: userEmail,
        user_password: pwHash,
      });
      return await this.userRepository.save(userEntity);
    } catch (error) {
      throw new HttpException(
        {
          title: 'login.error.create_user.title',
          text: 'login.error.create_user.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
