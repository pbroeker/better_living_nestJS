import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';

@Injectable()
export class SharedUserService {
  constructor(
    @InjectRepository(CoreUser)
    private userRepository: Repository<CoreUser>,
  ) {}

  async findAll(): Promise<CoreUser[]> {
    return await this.userRepository.find();
  }

  async findByEmail(email: string, relations?: string[]): Promise<CoreUser> {
    if (relations) {
      return await this.userRepository.findOne({ user_email: email });
    } else {
      return await this.userRepository.findOne(
        { user_email: email },
        { relations },
      );
    }
  }
}
