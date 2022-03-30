import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SharedUserService } from '../../shared/shared-user.service';
import { UserService } from '../users/users.service';
@Injectable()
export class AuthService {
  constructor(
    private sharedUserService: SharedUserService,
    private userService: UserService,
  ) {}

  async loginUser(email: string, password: string) {
    const user = await this.sharedUserService.findByEmail(email);
    if (user) {
      const passwordMatches = await this.checkPassword(
        password,
        user.user_password,
      );
      if (passwordMatches) {
        return user;
      } else {
        throw new HttpException(
          {
            title: 'login.error.wrong_password.title',
            text: 'login.error.wrong_password.message',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    } else {
      const createdUser = await this.userService.createUser(email, password);
      return createdUser;
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
