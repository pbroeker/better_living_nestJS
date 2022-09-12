import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserReqDto } from './dto/login-user.dto';
import { CoreUser } from '../users/entity/user.entity';
import { AuthService } from './auth.service';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SharedUserService } from '../../shared/shared-user.service';
import { TokenPayload } from 'src/types/token';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const fakeCoreUser: CoreUser = {
  user_email: 'fakemail@dropmail.cc',
  user_password: 'fakePassword123',
  id: 1,
  guests: [],
  hosts: [],
  personalAreas: [],
  personalRooms: [],
  userTags: [],
  images: [],
  invitationTokens: [],
  currentHashedRefreshToken: '',
  news_consent: false,
  ownedAreas: [],
  first_name: 'first_fake_name',
};

const registerUserReqFake: RegisterUserReqDto = {
  email: 'fakemail@dropmail.cc',
  password: Buffer.from('fakePassword123').toString('base64'),
  first_name: 'first_fake_name',
};

const fakePayload: TokenPayload = {
  username: fakeCoreUser.user_email,
  sub: fakeCoreUser.id,
};

const fakeToken = {
  access_token: 'fakeAccessToken',
  refresh_token: 'fakeRefreshToken',
};

const CoreUserRepositoryFake = {
  save: jest.fn(),
  create: jest.fn(),
};

const moduleMocker = new ModuleMocker(global);

describe('AuthService', () => {
  let authService: AuthService;
  let coreUserRepository: Repository<CoreUser>;
  let userService: UserService;
  let jwtService: JwtService;
  let sharedUserService: SharedUserService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(CoreUser),
          useValue: CoreUserRepositoryFake,
        },
      ],
    })
      .useMocker((token) => {
        if (token === SharedUserService) {
          return {
            findByEmail: jest
              .fn()
              .mockResolvedValueOnce(null)
              .mockResolvedValue(fakeCoreUser),
            setCurrentRefreshToken: jest.fn().mockResolvedValue(true),
          };
        }
        if (token === UserService) {
          return {
            createUser: jest.fn().mockResolvedValue(fakeCoreUser),
          };
        }
        if (token === JwtService) {
          return {
            signAsync: jest
              .fn()
              .mockResolvedValueOnce(fakeToken.access_token)
              .mockResolvedValueOnce(fakeToken.refresh_token)
              .mockResolvedValueOnce(fakeToken.access_token)
              .mockResolvedValueOnce(fakeToken.refresh_token)
              .mockResolvedValueOnce(fakeToken.access_token)
              .mockResolvedValueOnce(fakeToken.refresh_token),
          };
        }
        if (token === UserService) {
          return {
            createUser: jest.fn().mockResolvedValue(fakeCoreUser),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    authService = moduleRef.get<AuthService>(AuthService);
    coreUserRepository = moduleRef.get(getRepositoryToken(CoreUser));
    userService = moduleRef.get<UserService>(UserService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    sharedUserService = moduleRef.get<SharedUserService>(SharedUserService);
  });

  describe('register a user', () => {
    it('calls sharedUserService.findByEmail with correct paramaters', async () => {
      await authService.registerUser(registerUserReqFake);
      expect(sharedUserService.findByEmail).toHaveBeenCalledTimes(1);
      expect(sharedUserService.findByEmail).toBeCalledWith(
        registerUserReqFake.email.toLocaleLowerCase(),
      );
    });

    it('calls userService.createUser with correct paramaters', async () => {
      expect(userService.createUser).toHaveBeenCalledTimes(1);
      expect(userService.createUser).toHaveBeenCalledWith(registerUserReqFake);
    });

    it('calls jwtService.signAsync with correct paramaters', async () => {
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenCalledWith(fakePayload, {
        expiresIn: undefined,
        secret: undefined,
      });
    });

    it('calls sharedUserService.setCurrentRefreshToken with correct paramaters', async () => {
      expect(sharedUserService.setCurrentRefreshToken).toHaveBeenCalledTimes(1);
      expect(sharedUserService.setCurrentRefreshToken).toHaveBeenCalledWith(
        fakeCoreUser.id,
        fakeToken.refresh_token,
      );
    });

    it('throws an error when user exists already', async () => {
      try {
        expect(await authService.registerUser(registerUserReqFake));
      } catch (error) {
        expect(sharedUserService.findByEmail).toHaveBeenCalledTimes(2);
        expect(sharedUserService.findByEmail).toBeCalledWith(
          registerUserReqFake.email.toLocaleLowerCase(),
        );
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response.title).toBe('login.error.already_existing.title');
        expect(error.status).toBe(401);
      }
    });
  });

  describe('login a user', () => {
    const mockBcrypt = jest
      .spyOn(bcrypt, 'compare')
      .mockResolvedValueOnce(true)
      .mockResolvedValue(false);

    it('returns the correct value on successfull run', async () => {
      const { user_password, user_email, id, ...userNoPW } = fakeCoreUser;
      expect(
        await authService.loginUser(
          registerUserReqFake.email,
          registerUserReqFake.password,
        ),
      ).toStrictEqual({
        ...userNoPW,
        email: fakeCoreUser.user_email,
        access_token: fakeToken.access_token,
        refresh_token: fakeToken.refresh_token,
      });
    });

    it('calls sharedUserService.findByEmail with correct paramaters', () => {
      expect(sharedUserService.findByEmail).toHaveBeenCalledTimes(3);
      expect(sharedUserService.findByEmail).toBeCalledWith(
        registerUserReqFake.email,
      );
    });

    it('calls bcrupt.compare with correct paramaters', async () => {
      expect(mockBcrypt).toHaveBeenCalledTimes(1);
      expect(mockBcrypt).toHaveBeenCalledWith(
        Buffer.from(registerUserReqFake.password, 'base64').toString(),
        fakeCoreUser.user_password,
      );
    });

    it('calls jwtService.signAsync with correct paramaters', async () => {
      expect(jwtService.signAsync).toHaveBeenCalledTimes(4);
      expect(jwtService.signAsync).toHaveBeenCalledWith(fakePayload, {
        expiresIn: undefined,
        secret: undefined,
      });
    });

    it('calls sharedUserService.setCurrentRefreshToken with correct paramaters', async () => {
      expect(sharedUserService.setCurrentRefreshToken).toHaveBeenCalledTimes(2);
      expect(sharedUserService.setCurrentRefreshToken).toHaveBeenCalledWith(
        fakeCoreUser.id,
        fakeToken.refresh_token,
      );
    });
  });
});
