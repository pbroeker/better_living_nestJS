import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CoreUserDto } from 'src/core/users/dto/core-user.dto';
import { User } from 'src/utils/customDecorators/user.decorator';
import {
  PersonalAreaReqDto,
  PersonalAreaResDto,
} from './dto/personal-area.dto';
import { PersonalAreaService } from './personal-area.service';

@ApiBearerAuth()
@Controller('personal-areas')
export class PersonalAreaController {
  constructor(private personalAreaService: PersonalAreaService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning personal areas',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Wrong user credentials',
  })
  @Get()
  async getAllAreas(@User() user: CoreUserDto): Promise<PersonalAreaResDto[]> {
    return await this.personalAreaService.getAllAreas(user);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Personal area created',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Wrong user credentials',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Personal area could not be created',
  })
  @Post()
  async savePersonalRooms(
    @Body() personalAreaReqDto: PersonalAreaReqDto,
    @User() user: CoreUserDto,
  ): Promise<PersonalAreaResDto> {
    return await this.personalAreaService.createPersonalArea(
      personalAreaReqDto,
      user,
    );
  }
}
