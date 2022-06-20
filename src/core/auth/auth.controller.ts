import { SkipAuth } from '../../utils/customDecorators/skipAuth.decorator';
import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserReqDto, LoginUserResDto } from './dto/login-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import {
  CoreUserDto,
  CoreUserWithRefreshTokenDto,
} from '../users/dto/core-user.dto';
import { RtGuard } from './guards';

@ApiTags('authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return await this.authService.loginUser(
      loginUserDto.email,
      loginUserDto.password,
    );
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access token refreshed',
  })
  @SkipAuth()
  @UseGuards(RtGuard)
  @Post('/refresh')
  async refresh(
    @User() user: CoreUserWithRefreshTokenDto,
  ): Promise<LoginUserResDto> {
    return await this.authService.refreshToken(user.email, user.refreshToken);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged out',
  })
  @Post('/logout')
  async logout(@User() user: CoreUserDto): Promise<boolean> {
    return await this.authService.logout(user.userId);
  }
}
