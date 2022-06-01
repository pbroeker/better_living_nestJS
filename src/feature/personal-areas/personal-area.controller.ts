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
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import {
  PersonalAreaReqDto,
  PersonalAreaResDto,
} from './dto/personal-area.dto';
import { PersonalAreaService } from './personal-area.service';

@ApiBearerAuth()
@ApiTags('living-area')
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
  @ApiQuery({
    name: 'numberOfImages',
    type: Number,
    description: 'Amount of images to be included in rooms',
    required: false,
  })
  @Get()
  async getAllAreas(
    @User() user: CoreUserDto,
    @Query('imageCount') imageCount?: number,
  ): Promise<PersonalAreaResDto[]> {
    return await this.personalAreaService.getAllAreas(user, imageCount);
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

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Area deleted',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Area could not be deleted',
  })
  @Delete('/:areaId')
  async deleteArea(
    @User() user: CoreUserDto,
    @Param('areaId', ParseIntPipe) areaId: number,
  ): Promise<boolean> {
    return await this.personalAreaService.deleteArea(user, areaId);
  }
}
