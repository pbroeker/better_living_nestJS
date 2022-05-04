import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SharedUserService {
  constructor(
    @InjectRepository(CoreUser)
    private userRepository: Repository<CoreUser>,
    private configService: ConfigService,
  ) {}

  async findAll(): Promise<CoreUser[]> {
    return await this.userRepository.find();
  }

  async findByEmail(email: string, relations?: string[]): Promise<CoreUser> {
    if (!relations) {
      return await this.userRepository.findOne({ user_email: email });
    } else {
      return await this.userRepository.findOne(
        { user_email: email },
        { relations },
      );
    }
  }

  async setCurrentRefreshToken(userId: number, newRefreshToken: string) {
    const salt = parseInt(this.configService.get<string>('BCRYPT_SALT'));
    const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, salt);
    await this.userRepository.update(userId, {
      currentHashedRefreshToken: newHashedRefreshToken,
    });
  }

  async removeRefreshToken(userId: number): Promise<boolean> {
    const updateResult = await this.userRepository.update(
      {
        id: userId,
        currentHashedRefreshToken: Not(IsNull()),
      },
      { currentHashedRefreshToken: null },
    );

    return updateResult.affected > 0;
  }
}
