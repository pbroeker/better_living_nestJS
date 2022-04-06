import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreUser } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedAuthService } from '../../shared/shared-auth.service';
import { PersonalAreaService } from 'src/feature/personal-areas/personal-area.service';
import { CoreUserDto } from './dto/core-user.dto';
@Injectable()
export class UserService {
  constructor(
    private sharedAuthServiceService: SharedAuthService,
    private personalAreaService: PersonalAreaService,
    @InjectRepository(CoreUser)
    private userRepository: Repository<CoreUser>,
  ) {}

  async createUser(
    userEmail: string,
    userPassword: string,
  ): Promise<CoreUserDto> {
    try {
      const decodedPassword = Buffer.from(userPassword, 'base64').toString();
      const pwHash = await this.sharedAuthServiceService.hashPassword(
        decodedPassword,
      );
      const userEntity = this.userRepository.create({
        user_email: userEmail,
        user_password: pwHash,
      });
      const savedUserEntity = await this.userRepository.save(userEntity);
      await this.personalAreaService.createPersonalArea(
        {
          title: 'Unassigned',
          personalRoomIds: [],
        },
        {
          userId: savedUserEntity.id,
          email: savedUserEntity.user_email,
        },
      );
      return { userId: savedUserEntity.id, email: savedUserEntity.user_email };
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
