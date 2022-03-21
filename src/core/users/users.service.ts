import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedAuthServiceService } from '../../shared/shared-auth-service/shared-auth-service.service';

@Injectable()
export class UsersService {
  constructor(
    private sharedAuthServiceService: SharedAuthServiceService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ user_email: email });
  }

  async createUser(userEmail: string, userPassword: string): Promise<User> {
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
          title: 'error_creating_user',
          text: 'couldnt_create_user',
          options: 1,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
