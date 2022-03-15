import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { SharedAuthServiceService } from '../../shared/shared-auth-service/shared-auth-service.service';
import { plainToClass } from 'class-transformer';
import { LoginUserDto } from './dto/login-user.dto';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sharedAuthServiceService: SharedAuthServiceService,
  ) {}

  async loginUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      const passwordMatches = await this.checkPassword(
        password,
        user.user_password,
      );
      if (passwordMatches) {
        const userDTO = plainToClass(LoginUserDto, {
          email: user.user_email,
        });
        return userDTO;
      } else {
        // TODO: Returning error with message
        return 'password is not valid';
      }
    } else {
      const createdUser = await this.usersService.createUser(email, password);
      const userDTO = plainToClass(LoginUserDto, {
        email: createdUser.user_email,
      });
      return userDTO;
    }
  }

  async checkPassword(
    loginPassword: string,
    userPassword: string,
  ): Promise<boolean> {
    const decodedPassword = Buffer.from(loginPassword, 'base64').toString();
    const pwHash = await this.sharedAuthServiceService.hashPassword(
      decodedPassword,
    );
    const passwordMatches = await bcrypt.compare(userPassword, pwHash);
    return passwordMatches;
  }
}
