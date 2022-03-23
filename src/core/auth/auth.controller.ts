import { JwtService } from '@nestjs/jwt';
import { SkipAuth } from '../../utils/customDecorators/skipAuth.decorator';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserReqDto, LoginUserResDto } from './dto/login-user.dto';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @SkipAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged in',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Wrong user credentials',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'User could not be created',
  })
  @Post('/login')
  async login(@Body() loginUserDto: LoginUserReqDto): Promise<LoginUserResDto> {
    const userEntity = await this.authService.loginUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (userEntity) {
      const payload = { username: userEntity.user_email, sub: userEntity.id };
      return {
        email: loginUserDto.email,
        token: this.jwtService.sign(payload),
      } as LoginUserResDto;
    }
  }
}
