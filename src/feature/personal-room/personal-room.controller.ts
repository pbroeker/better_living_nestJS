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
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { PersonalRoomDto } from './dto/personal-room.dto';
import { PersonalRoomService } from './personal-room.service';
import { User } from '../../utils/customDecorators/user.decorator';
import { CoreUserDto } from 'src/core/users/dto/core-user.dto';

@ApiBearerAuth()
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
    description: 'Personal Rooms created',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Wrong user credentials',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Personal Rooms could not be created',
  })
  @ApiBody({
    type: PersonalRoomDto,
    isArray: true,
  })
  @Post()
  async savePersonalRooms(
    @Body() personalRoomDtos: PersonalRoomDto[],
    @User() user: CoreUserDto,
  ): Promise<PersonalRoomDto[]> {
    return await this.personalRoomService.savePersonalRooms(
      personalRoomDtos,
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
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() editRoomDto: PersonalRoomDto,
    @User() user: CoreUserDto,
  ): Promise<PersonalRoomDto> {
    return await this.personalRoomService.editPersonalRoomTitle(
      editRoomDto.title,
      roomId,
      user,
    );
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Room deleted',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Wrong user credentials',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Could not be deleted',
  })
  @Delete('/:roomId')
  async deleteRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @User() user: CoreUserDto,
  ): Promise<PersonalRoomDto> {
    return await this.personalRoomService.deleteRoom(user, roomId);
  }
}
