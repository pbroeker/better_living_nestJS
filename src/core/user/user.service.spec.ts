import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserReqDto } from '../auth/dto/login-user.dto';
import { CoreUser } from './entity/user.entity';
import { UserService } from './user.service';
import { SharedAuthService } from '../../shared/shared-auth.service';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';

const CoreUserRepositoryFake = {
  save: jest.fn(),
  create: jest.fn(),
};

describe('UserService', () => {
  let userService: UserService;
  let coreUserRepository: Repository<CoreUser>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SharedAuthService,
        UserService,
        ConfigService,
        {
          provide: getRepositoryToken(CoreUser),
          //   useValue: { create: jest.fn(), save: jest.fn() },
          useValue: CoreUserRepositoryFake,
        },
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    coreUserRepository = moduleRef.get(getRepositoryToken(CoreUser));
  });

  describe('creating a user', () => {
    it('calls the repository with correct paramaters', async () => {
      const plainPW = 'fakePassword123';
      const encodedPW = Buffer.from(plainPW).toString('base64');

      const fakeUserData: RegisterUserReqDto = {
        email: 'fakemail@dropmail.cc',
        password: encodedPW,
        first_name: 'first_fake_name',
      };

      const expectedCallData: Partial<CoreUser> = {
        ...fakeUserData,
        user_email: fakeUserData.email,
        first_name: 'first_fake_name',
        user_password: expect.anything(),
      };
      await userService.createUser(fakeUserData);

      expect(coreUserRepository.create).toHaveBeenCalledTimes(1);
      expect(coreUserRepository.save).toHaveBeenCalledTimes(1);
      expect(coreUserRepository.create).toHaveBeenCalledWith(expectedCallData);
    });

    it('throwing an error when using too short pw', async () => {
      const shortPW = 'fA3';
      const encodedPW = Buffer.from(shortPW).toString('base64');

      const shortPwData: RegisterUserReqDto = {
        email: 'fakemail@dropmail.cc',
        password: encodedPW,
        first_name: 'first_fake_name',
      };

      try {
        await userService.createUser(shortPwData);
      } catch (error) {
        expect(coreUserRepository.create).toHaveBeenCalledTimes(1);
        expect(coreUserRepository.save).toHaveBeenCalledTimes(1);
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response.title).toBe('login.error.short_pw.title');
        expect(error.status).toBe(500);
      }
    });
  });
});
