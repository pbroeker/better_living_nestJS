import {
  LoginUserResDto,
  RegisterUserReqDto,
} from 'src/core/auth/dto/login-user.dto';
import {
  CoreUserDto,
  CoreUserWithRefreshTokenDto,
} from 'src/core/users/dto/core-user.dto';
import { ImageFilterQuery } from 'src/feature/user-image/dto/user-image.dto';

export const mockCoreUserDto: CoreUserDto = {
  email: 'fakemail@dropmail.cc',
  userId: 1,
  first_name: 'first_fake_name',
};

export const mockImageFilter1: ImageFilterQuery = {
  tagIds: [1],
  roomIds: [1],
};

export const mockLoginUserRes: LoginUserResDto = {
  first_name: 'testFirstName',
  news_consent: false,
  access_token: 'testAccessToken',
  refresh_token: 'testRefreshToken',
  email: 'testEmail',
};

export const fakeUserData: RegisterUserReqDto = {
  email: 'fakemail@dropmail.cc',
  password: 'fakePassword123',
  first_name: 'first_fake_name',
};

export const refreshTokenDto: CoreUserWithRefreshTokenDto = {
  ...mockLoginUserRes,
  userId: 1,
  refreshToken: 'fakeRefreshToken',
};
