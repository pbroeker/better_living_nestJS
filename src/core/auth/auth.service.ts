import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { SharedAuthServiceService } from 'src/shared/shared-auth-service/shared-auth-service.service';
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
        const { user_password, ...result } = user;
        return result;
      } else {
        // TODO: Returning error with message
        return 'password is not valid';
      }
    } else {
      const createdUser = await this.usersService.createUser(email, password);
      const { user_password, ...result } = createdUser;
      return result;
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
