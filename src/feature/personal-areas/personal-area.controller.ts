import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CoreUserDto } from 'src/core/users/dto/core-user.dto';
import { User } from 'src/utils/customDecorators/user.decorator';
import {
  PersonalAreaReqDto,
  PersonalAreaResDto,
} from './dto/personal-area.dto';
import { PersonalAreaService } from './personal-area.service';

@ApiBearerAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Wrong user credentials',
})
@Controller('personal-areas')
export class PersonalAreaController {
  constructor(private personalAreaService: PersonalAreaService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning personal areas',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Personal areas could not be loaded',
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
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Personal area could not be created',
  })
  @Post()
  async createPersonalArea(
    @Body() personalAreaReqDto: PersonalAreaReqDto,
    @User() user: CoreUserDto,
  ): Promise<PersonalAreaResDto> {
    return await this.personalAreaService.createPersonalArea(
      personalAreaReqDto,
      user,
    );
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Personal area edited',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Personal area could not be edited',
  })
  @ApiBody({
    type: PersonalAreaReqDto,
  })
  @Put('/:areaId')
  async editPersonalArea(
    @Param('areaId', ParseIntPipe) areaId: number,
    @Body() personalAreaReqDto: PersonalAreaReqDto,
    @User() user: CoreUserDto,
  ): Promise<PersonalAreaResDto> {
    return await this.personalAreaService.editPersonalArea(
      areaId,
      personalAreaReqDto,
      user,
    );
  }
}
