import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { PersonalAreaController } from './personal-area.controller';
import { PersonalAreaService } from './personal-area.service';
import { mockCoreUserDto } from '../../../test/mocks/coreMocks';
import {
  mockPersonalAreaReqDto,
  mockPersonalAreaResDto,
} from '../../../test/mocks/personalAreaMocks';

const moduleMocker = new ModuleMocker(global);

describe('personal-Area', () => {
  let personalAreaController: PersonalAreaController;
  let personalAreaService: PersonalAreaService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PersonalAreaController],
    })
      .useMocker((token) => {
        if (token === PersonalAreaService) {
          return {
            getAllAreas: jest.fn().mockResolvedValue([mockPersonalAreaResDto]),
            createPersonalArea: jest
              .fn()
              .mockResolvedValue(mockPersonalAreaResDto),
            editPersonalArea: jest
              .fn()
              .mockResolvedValue(mockPersonalAreaResDto),

            deleteArea: jest.fn().mockResolvedValue(true),
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
    personalAreaController = moduleRef.get<PersonalAreaController>(
      PersonalAreaController,
    );
    personalAreaService =
      moduleRef.get<PersonalAreaService>(PersonalAreaService);
  });

  describe('getAllAreas', () => {
    it('calls getAllAreas with correct arguments', async () => {
      expect(
        await personalAreaController.getAllAreas(mockCoreUserDto, 10),
      ).toStrictEqual([mockPersonalAreaResDto]);
      expect(personalAreaService.getAllAreas).toHaveBeenCalledTimes(1);
      expect(personalAreaService.getAllAreas).toHaveBeenCalledWith(
        mockCoreUserDto,
        10,
      );
    });
  });

  describe('createPersonalArea', () => {
    it('calls createPersonalArea with correct arguments', async () => {
      expect(
        await personalAreaController.createPersonalArea(
          mockPersonalAreaReqDto,
          mockCoreUserDto,
        ),
      ).toStrictEqual(mockPersonalAreaResDto);
      expect(personalAreaService.createPersonalArea).toHaveBeenCalledTimes(1);
      expect(personalAreaService.createPersonalArea).toHaveBeenCalledWith(
        mockPersonalAreaReqDto,
        mockCoreUserDto,
      );
    });
  });

  describe('editPersonalArea', () => {
    it('calls editPersonalArea with correct arguments', async () => {
      expect(
        await personalAreaController.editPersonalArea(
          1,
          mockPersonalAreaReqDto,
          mockCoreUserDto,
        ),
      ).toStrictEqual(mockPersonalAreaResDto);
      expect(personalAreaService.editPersonalArea).toHaveBeenCalledTimes(1);
      expect(personalAreaService.editPersonalArea).toHaveBeenCalledWith(
        1,
        mockPersonalAreaReqDto,
        mockCoreUserDto,
      );
    });
  });

  describe('deleteArea', () => {
    it('calls deleteArea with correct arguments', async () => {
      expect(await personalAreaController.deleteArea(mockCoreUserDto, 1)).toBe(
        true,
      );
      expect(personalAreaService.deleteArea).toHaveBeenCalledTimes(1);
      expect(personalAreaService.deleteArea).toHaveBeenCalledWith(
        mockCoreUserDto,
        1,
      );
    });
  });
});
