import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreUser } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedAuthService } from '../../shared/shared-auth.service';
import { RegisterUserReqDto } from '../auth/dto/login-user.dto';
@Injectable()
export class UserService {
  constructor(
    private sharedAuthServiceService: SharedAuthService,
    @InjectRepository(CoreUser)
    private userRepository: Repository<CoreUser>,
  ) {}

  async createUser(registerUserDto: RegisterUserReqDto): Promise<CoreUser> {
    const decodedPassword = Buffer.from(
      registerUserDto.password,
      'base64',
    ).toString();

    if (decodedPassword.length < 4) {
      throw new HttpException(
        {
          title: 'login.error.short_pw.title',
          text: 'login.error.short_pw.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const pwHash = await this.sharedAuthServiceService.hashPassword(
      decodedPassword,
    );
    const userEntity = this.userRepository.create({
      ...registerUserDto,
      user_email: registerUserDto.email,
      user_password: pwHash,
    });

    const savedUserEntity = await this.userRepository.save(userEntity);
    return savedUserEntity;
  }
}
