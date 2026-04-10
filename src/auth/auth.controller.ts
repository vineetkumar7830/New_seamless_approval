import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Step1Dto } from './dto/step1.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Step2Dto } from './dto/step2.dto';
import { Step3Dto } from './dto/step3.dto';
import { Step4Dto } from './dto/step4.dto';
import { LoginDto } from './dto/login.dto';
import { SendPhoneOtpDto } from './dto/send-phone-otp.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/step-1')
  @HttpCode(HttpStatus.CREATED)
  registerStep1(@Body() dto: Step1Dto) {
    return this.authService.registerStep1(dto);
  }

  @Post('register/verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }
  
  @Post('phone/send-otp')
  @HttpCode(HttpStatus.OK)
  sendPhoneOtp(@Body() dto: SendPhoneOtpDto) {
    return this.authService.sendPhoneOtp(dto);
  }

  @Post('phone/verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyPhoneOtp(@Body() dto: VerifyPhoneOtpDto) {
    return this.authService.verifyPhoneOtp(dto);
  }

  @Post('register/step-2')
  @HttpCode(HttpStatus.OK)
  registerStep2(@Body() dto: Step2Dto) {
    return this.authService.registerStep2(dto);
  }

  @Post('register/step-3')
  @HttpCode(HttpStatus.OK)
  registerStep3(@Body() dto: Step3Dto) {
    return this.authService.registerStep3(dto);
  }

  @Post('register/step-4')
  @HttpCode(HttpStatus.OK)
  registerStep4(@Body() dto: Step4Dto) {
    return this.authService.registerStep4(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
