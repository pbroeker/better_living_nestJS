import {
  PersonalRoomReqDto,
  PersonalRoomResDto,
} from 'src/feature/personal-room/dto/personal-room.dto';
import { PaginatedImagesResDto } from 'src/feature/user-image/dto/user-image.dto';

export const mockPersonalRoomResDto1: PersonalRoomResDto = {
  title: 'mockTitle',
  iconId: 1,
  id: 1,
};

export const mockPaginatedImagesResDto: PaginatedImagesResDto = {
  images: [],
  total: 0,
  currentPage: 1,
  lastPage: 1,
  filterOptions: {},
};

export const mockPersonalRoomReqDto: PersonalRoomReqDto = {
  title: 'mockPersonalRoomTitle',
  iconId: 5,
  areaId: 2,
};
