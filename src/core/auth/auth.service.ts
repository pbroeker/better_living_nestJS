import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { SharedUserService } from '../../shared/shared-user.service';
import { UserService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginUserResDto } from './dto/login-user.dto';
import { TokenPayload } from '../../types/token';

@Injectable()
export class AuthService {
  constructor(
    private sharedUserService: SharedUserService,
    private userService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async loginUser(email: string, password: string): Promise<LoginUserResDto> {
    const userEntity = await this.sharedUserService.findByEmail(email);

    // if user does exist, validate
    if (userEntity) {
      const passwordMatches = await this.checkPassword(
        password,
        userEntity.user_password,
      );
      if (passwordMatches) {
        const payload = {
          username: userEntity.user_email,
          sub: userEntity.id,
        };
        const accessToken = this.getAccessToken(payload);
        const refreshToken = this.getRefreshToken(payload);
        await this.sharedUserService.setCurrentRefreshToken(
          userEntity.id,
          refreshToken,
        );
        return {
          email: userEntity.user_email,
          access_token: accessToken,
          refresh_token: refreshToken,
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
    } else {
      // if user doesnt exist, create one
      const createdUser = await this.userService.createUser(email, password);
      const payload = {
        username: createdUser.email,
        sub: createdUser.userId,
      };
      const accessToken = this.getAccessToken(payload);
      const refreshToken = this.getRefreshToken(payload);
      await this.sharedUserService.setCurrentRefreshToken(
        createdUser.userId,
        refreshToken,
      );
      return {
        email: createdUser.email,
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    }
  }

  async logout(userId: number) {
    try {
      return await this.sharedUserService.removeRefreshToken(userId);
    } catch (error) {
      throw new HttpException(
        {
          title: 'login.error.logout.title',
          text: 'login.error.logout.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refreshToken(
    email: string,
    refreshToken: string,
  ): Promise<LoginUserResDto> {
    const userEntity = await this.sharedUserService.findByEmail(email);

    // no refreshToken
    if (!userEntity || !userEntity.currentHashedRefreshToken) {
      throw new HttpException(
        {
          title: 'login.error.no_refresh_token.title',
          text: 'login.error.no_refresh_token.message',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const rtMatches = await bcrypt.compare(
      refreshToken,
      userEntity.currentHashedRefreshToken,
    );

    // refreshToken doesn't match
    if (!rtMatches)
      throw new HttpException(
        {
          title: 'login.error.matching_refresh_token.title',
          text: 'login.error.matching_refresh_token.message',
        },
        HttpStatus.UNAUTHORIZED,
      );

    const payload = {
      username: userEntity.user_email,
      sub: userEntity.id,
    };
    const accessToken = this.getAccessToken(payload);
    const newRefreshToken = this.getRefreshToken(payload);
    await this.sharedUserService.setCurrentRefreshToken(
      userEntity.id,
      newRefreshToken,
    );
    return {
      refresh_token: newRefreshToken,
      access_token: accessToken,
      email: userEntity.user_email,
    };
  }

  async checkPassword(
    loginPassword: string,
    userPassword: string,
  ): Promise<boolean> {
    const decodedPassword = Buffer.from(loginPassword, 'base64').toString();
    const passwordMatches = await bcrypt.compare(decodedPassword, userPassword);
    return passwordMatches;
  }

  private getAccessToken(payload: TokenPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRATION_TIME'),
    });
    return accessToken;
  }

  private getRefreshToken(payload: TokenPayload) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
    });
    return refreshToken;
  }
}
