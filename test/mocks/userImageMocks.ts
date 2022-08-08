import {
  EditImageDto,
  UserImageDto,
  ImageFilterQuery,
} from 'src/feature/user-image/dto/user-image.dto';

export const mockUserImageDto: UserImageDto = {
  id: 1,
  src: 'testsource',
  key: 'testKey',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockEditImageDto: EditImageDto = {
  imageIds: [1, 2],
  personalRoomIds: [1],
  usertagIds: [2],
  newUsertags: ['mockTag'],
};

export const mockUploadImageRequest: Express.Request = {
  logIn: jest.fn(),
  logOut: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  isUnauthenticated: jest.fn(),
  isAuthenticated: jest.fn(),
};

export const mockUploadImageResponse: Express.Response = {
  testResponse: 'test',
};

export const mockImageFilter1: ImageFilterQuery = {
  tagIds: [1],
  roomIds: [1],
};
