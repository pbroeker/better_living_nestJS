import {
  PersonalAreaReqDto,
  PersonalAreaResDto,
} from 'src/feature/personal-areas/dto/personal-area.dto';

export const mockPersonalAreaResDto: PersonalAreaResDto = {
  title: 'mockPersonalAreaTitle',
  id: 1,
};

export const mockPersonalAreaReqDto: PersonalAreaReqDto = {
  title: 'mockPersonalAreaTitle',
  personalRoomIds: [1, 2],
};
