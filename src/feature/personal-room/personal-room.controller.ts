import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PersonalRoomReqDto,
  PersonalRoomResDto,
} from './dto/personal-room.dto';
import { PersonalRoomService } from './personal-room.service';
import { User } from '../../utils/customDecorators/user.decorator';
import { CoreUserDto } from '../../core/user/dto/core-user.dto';
import {
  ImageFilterQuery,
  PaginatedImagesResDto,
} from '../user-image/dto/user-image.dto';

@ApiBearerAuth()
@ApiTags('personal-room')
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Wrong user credentials',
})
@Controller('personal-rooms')
export class PersonalRoomController {
  constructor(private personalRoomService: PersonalRoomService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning personal rooms',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Rooms could not be loaded',
    type: [PersonalRoomResDto],
  })
  @ApiQuery({
    name: 'imageCount',
    type: Number,
    description: 'Amount of images to be included in rooms',
    required: false,
  })
  @Get()
  async getAllRooms(
    @User() user: CoreUserDto,
    @Query('imageCount') imageCount?: number,
  ): Promise<PersonalRoomResDto[]> {
    return await this.personalRoomService.getAllRooms(user, imageCount);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning rooms images',
    type: PaginatedImagesResDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Images could not be loaded',
  })
  @Get('/images/:roomId/:page')
  async getRoomImages(
    @User() user: CoreUserDto,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Param('page', ParseIntPipe) page: number,
    @Query() imageFilter?: ImageFilterQuery,
  ): Promise<PaginatedImagesResDto> {
    return await this.personalRoomService.getRoomImages(
      user,
      roomId,
      page,
      imageFilter,
    );
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Personal Rooms created',
    type: [PersonalRoomResDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Personal Rooms could not be created',
  })
  @ApiBody({
    type: PersonalRoomReqDto,
    isArray: true,
  })
  @Post()
  async createPersonalRooms(
    @Body() personalRoomDtos: PersonalRoomReqDto[],
    @User() user: CoreUserDto,
  ): Promise<PersonalRoomResDto[]> {
    return await this.personalRoomService.createPersonalRooms(
      personalRoomDtos,
      user,
    );
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Name edited',
    type: PersonalRoomResDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Name could not be edited',
  })
  @Put('/:roomId')
  async editPersonalRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() editRoomDto: PersonalRoomReqDto,
  ): Promise<PersonalRoomResDto> {
    return await this.personalRoomService.editPersonalRoom(roomId, editRoomDto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Room deleted',
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Could not be deleted',
  })
  @Delete('/:roomId')
  async deleteRoom(
    @User() user: CoreUserDto,
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<boolean> {
    return await this.personalRoomService.deleteRoom(user, roomId);
  }
}
