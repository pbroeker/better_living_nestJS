import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SkipAuth } from '../../utils/customDecorators/skipAuth.decorator';
import { AuthService } from './auth.service';
import { LoginUserReqDto, LoginUserResDto } from './dto/login-user.dto';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @SkipAuth()
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
