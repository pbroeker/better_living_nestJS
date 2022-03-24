import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { PersonalRoomDto } from './dto/personal-room.dto';
import { PersonalRoomService } from './personal-room.service';
import { User } from '../../utils/customDecorators/user.decorator';
import { CoreUserDto } from 'src/core/users/dto/core-user.dto';

@Controller('personal-rooms')
export class PersonalRoomController {
  constructor(private personalRoomService: PersonalRoomService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning personal rooms',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Wrong user credentials',
  })
  @Get()
  async getAllRooms(@User() user: CoreUserDto): Promise<PersonalRoomDto[]> {
    return await this.personalRoomService.getAllRooms(user);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Personal Room created',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Wrong user credentials',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Personal Room could not be created',
  })
  @Post()
  async createPersonalRoom(
    @Body() personalRoomDto: PersonalRoomDto,
    @User() user: CoreUserDto,
  ): Promise<PersonalRoomDto> {
    return await this.personalRoomService.createPersonalRoom(
      personalRoomDto.title,
      user,
    );
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Name edited',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Wrong user credentials',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Name could not be edited',
  })
  @Put('/:roomId')
  async editPersonalRoom(
    @Param('roomId') roomId: number,
    @Body() editRoomDto: PersonalRoomDto,
    @User() user: CoreUserDto,
  ): Promise<PersonalRoomDto> {
    return await this.personalRoomService.editPersonalRoomTitle(
      editRoomDto.title,
      roomId,
      user,
    );
  }
}
