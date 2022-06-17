import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SharedUserService } from '../../shared/shared-user.service';
import { UserService } from '../users/users.service';
import { LoginUserResDto, RegisterUserReqDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private sharedUserService: SharedUserService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async registerUser(
    registerUserDto: RegisterUserReqDto,
  ): Promise<LoginUserResDto> {
    try {
      const userEntity = await this.sharedUserService.findByEmail(
        registerUserDto.email,
      );
      if (userEntity) {
        throw new HttpException(
          {
            title: 'login.error.already_existing.title',
            text: 'login.error.already_existing.message',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const createdUser = await this.userService.createUser(registerUserDto);
      const { user_password, user_email, id, ...userNoPW } = createdUser;
      const payload = { username: createdUser.user_email, sub: createdUser.id };
      return {
        ...userNoPW,
        email: createdUser.user_email,
        token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new HttpException(
        {
          title: error.response?.title
            ? error.response.title
            : 'login.error.internal.title',
          text: error.response?.text
            ? error.response.text
            : 'login.error.internal.message',
        },
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async loginUser(email: string, password: string): Promise<LoginUserResDto> {
    try {
      const user = await this.sharedUserService.findByEmail(email);
      const passwordMatches = await this.checkPassword(
        password,
        user.user_password,
      );
      if (passwordMatches) {
        const { user_password, user_email, id, ...userNoPW } = user;
        const payload = { username: user.user_email, sub: user.id };
        return {
          ...userNoPW,
          email: user.user_email,
          token: this.jwtService.sign(payload),
        };
      } else {
        throw new HttpException(
          {
            title: 'login.error.wrong_password.title',
            text: 'login.error.wrong_password.message',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          title: error.response?.title
            ? error.response.title
            : 'login.error.internal.title',
          text: error.response?.text
            ? error.response.text
            : 'login.error.internal.message',
        },
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkPassword(
    loginPassword: string,
    userPassword: string,
  ): Promise<boolean> {
    const decodedPassword = Buffer.from(loginPassword, 'base64').toString();
    const passwordMatches = await bcrypt.compare(decodedPassword, userPassword);
    return passwordMatches;
  }
}
