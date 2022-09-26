import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/utils/customDecorators/user.decorator';
import { CoreUserDto } from './dto/core-user.dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags('User')
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Wrong user credentials',
})
@Controller('user')
export class UsersController {
  constructor(private userService: UserService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted',
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'User could not be deleted',
  })
  @Delete()
  async deleteUser(@User() user: CoreUserDto): Promise<boolean> {
    return await this.userService.deleteUser(user);
  }
}
