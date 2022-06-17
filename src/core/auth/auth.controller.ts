import { SkipAuth } from '../../utils/customDecorators/skipAuth.decorator';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginUserReqDto,
  LoginUserResDto,
  RegisterUserReqDto,
} from './dto/login-user.dto';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged in',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Wrong user credentials',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Login was not possible',
  })
  @Post('/login')
  async login(@Body() loginUserDto: LoginUserReqDto): Promise<LoginUserResDto> {
    return await this.authService.loginUser(
      loginUserDto.email,
      loginUserDto.password,
    );
  }

  @SkipAuth()
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'User could not be created',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created',
  })
  @Post('/register')
  async register(
    @Body() registerUserDto: RegisterUserReqDto,
  ): Promise<LoginUserResDto> {
    return await this.authService.registerUser(registerUserDto);
  }
}
