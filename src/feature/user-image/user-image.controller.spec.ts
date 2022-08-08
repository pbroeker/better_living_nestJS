import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { UserImageController } from './user-image.controller';
import { UserImageService } from './user-image.service';
import {
  mockCoreUserDto,
  mockImageFilter1,
  mockUserImageDto,
  mockEditImageDto,
  mockUploadImageResponse,
  mockUploadImageRequest,
} from '../../../test/mocks/mocks';

const moduleMocker = new ModuleMocker(global);
describe('user-image-controller', () => {
  let userImageController: UserImageController;
  let userImageService: UserImageService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserImageController],
    })
      .useMocker((token) => {
        if (token === UserImageService) {
          return {
            getAllImages: jest.fn().mockResolvedValue([mockUserImageDto]),
            getUserImage: jest.fn().mockResolvedValue([mockUserImageDto]),
            getUserImagesCount: jest.fn().mockResolvedValue([mockUserImageDto]),
            saveUserImage: jest.fn().mockResolvedValue([mockUserImageDto]),
            imageUpload: jest.fn(),
            updateImage: jest.fn().mockResolvedValue([mockUserImageDto]),
            deleteImage: jest.fn().mockResolvedValue(true),
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
    userImageController =
      moduleRef.get<UserImageController>(UserImageController);
    userImageService = moduleRef.get<UserImageService>(UserImageService);
  });

  describe('getImages', () => {
    it('calls getAllImages with correct arguments', async () => {
      expect(
        await userImageController.getImages(mockCoreUserDto),
      ).toStrictEqual([mockUserImageDto]);
      expect(userImageService.getAllImages).toHaveBeenCalledTimes(1);
      expect(userImageService.getAllImages).toHaveBeenCalledWith(
        mockCoreUserDto,
      );
    });
  });

  describe('getImagesCount', () => {
    it('calls getImagesCount with correct arguments', async () => {
      expect(
        await userImageController.getImagesCount(
          mockCoreUserDto,
          1,
          mockImageFilter1,
        ),
      ).toStrictEqual([mockUserImageDto]);
      expect(userImageService.getUserImagesCount).toHaveBeenCalledTimes(1);
      expect(userImageService.getUserImagesCount).toHaveBeenCalledWith(
        mockCoreUserDto,
        1,
        mockImageFilter1,
      );
    });
  });

  describe('getUserImage', () => {
    it('calls getUserImage with correct arguments', async () => {
      expect(
        await userImageController.getUserImage(mockCoreUserDto, 1),
      ).toStrictEqual([mockUserImageDto]);
      expect(userImageService.getUserImage).toHaveBeenCalledTimes(1);
      expect(userImageService.getUserImage).toHaveBeenCalledWith(
        mockCoreUserDto,
        1,
      );
    });
  });

  describe('uploadImage', () => {
    it('calls uploadImage with correct arguments', async () => {
      await userImageController.uploadImage(
        mockCoreUserDto,
        mockUploadImageRequest,
        mockUploadImageResponse,
      );
      expect(userImageService.imageUpload).toHaveBeenCalledTimes(1);
      expect(userImageService.imageUpload).toHaveBeenCalledWith(
        mockUploadImageRequest,
        mockUploadImageResponse,
        mockCoreUserDto,
      );
    });
  });

  describe('updateImage', () => {
    it('calls updateImage with correct arguments', async () => {
      expect(
        await userImageController.updateImage(
          mockCoreUserDto,
          mockEditImageDto,
        ),
      ).toStrictEqual([mockUserImageDto]);
      expect(userImageService.updateImage).toHaveBeenCalledTimes(1);
      expect(userImageService.updateImage).toHaveBeenCalledWith(
        mockCoreUserDto,
        mockEditImageDto,
      );
    });
  });

  describe('deleteImage', () => {
    it('calls deleteImage with correct arguments', async () => {
      expect(await userImageController.deleteImage(mockCoreUserDto, 1)).toBe(
        true,
      );
      expect(userImageService.deleteImage).toHaveBeenCalledTimes(1);
      expect(userImageService.deleteImage).toHaveBeenCalledWith(
        mockCoreUserDto,
        1,
      );
    });
  });
});
