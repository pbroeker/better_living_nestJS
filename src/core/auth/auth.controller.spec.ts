import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { AuthService } from './auth.service';

import {
  mockCoreUserDto,
  fakeUserData,
  mockLoginUserRes,
  refreshTokenDto,
} from '../../../test/mocks/coreMocks';

const moduleMocker = new ModuleMocker(global);
describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService) {
          return {
            loginUser: jest.fn().mockResolvedValue(mockLoginUserRes),
            registerUser: jest.fn().mockResolvedValue(mockLoginUserRes),
            refreshToken: jest.fn().mockResolvedValue(mockLoginUserRes),
            logout: jest.fn().mockResolvedValue(true),
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
    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('calls registerUser with correct arguments', async () => {
      expect(await authController.register(fakeUserData)).toBe(
        mockLoginUserRes,
      );
      expect(authService.registerUser).toHaveBeenCalledTimes(1);
      expect(authService.registerUser).toHaveBeenCalledWith(fakeUserData);
    });
  });

  describe('login', () => {
    it('calls loginUser with correct arguments', async () => {
      expect(await authController.login(fakeUserData)).toBe(mockLoginUserRes);
      expect(authService.loginUser).toHaveBeenCalledTimes(1);
      expect(authService.loginUser).toHaveBeenCalledWith(
        fakeUserData.email,
        fakeUserData.password,
      );
    });
  });

  describe('refresh', () => {
    it('calls refresh with correct arguments', async () => {
      expect(await authController.refresh(refreshTokenDto)).toBe(
        mockLoginUserRes,
      );
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
      expect(authService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.email,
        refreshTokenDto.refreshToken,
      );
    });
  });

  describe('logout', () => {
    it('calls refresh with correct arguments', async () => {
      expect(await authController.logout(mockCoreUserDto)).toBe(true);
      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(authService.logout).toHaveBeenCalledWith(mockCoreUserDto.userId);
    });
  });
});
