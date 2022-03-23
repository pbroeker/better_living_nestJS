import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CreateRoomDto } from './dto/personal-room.dto';
import { PersonalRoomService } from './personal-room.service';

@Controller('personal-rooms')
export class PersonalRoomController {
  constructor(private personalRoomService: PersonalRoomService) {}
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
  async createRoom(
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<CreateRoomDto> {
    const personalRoomEntity =
      await this.personalRoomService.createPersonalRoom(createRoomDto.title);
    return {
      title: personalRoomEntity.title,
      id: personalRoomEntity.id,
    } as CreateRoomDto;
  }
}
