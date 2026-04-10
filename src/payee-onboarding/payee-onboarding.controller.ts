import { Controller, Get, Post, Body, Param, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { PayeeOnboardingService } from './payee-onboarding.service';
import { OnboardingDetailsDto } from './dto/onboarding-details.dto';
import { OnboardingBankDto } from './dto/onboarding-bank.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('payee-onboarding')
export class PayeeOnboardingController {
  constructor(private readonly onboardingService: PayeeOnboardingService) {}

  @Get('validate/:token')
  validate(@Param('token') token: string) {
    return this.onboardingService.validateToken(token);
  }

  @Post('submit-details')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  submitDetails(
    @GetUser('companyId') companyId: string,
    @GetUser('linkId') linkId: string,
    @Body() dto: OnboardingDetailsDto,
  ) {
    return this.onboardingService.submitDetails(companyId, linkId, dto);
  }
  

  @Post('submit-bank')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  submitBank(
    @GetUser('companyId') companyId: string,
    @GetUser('linkId') linkId: string,
    @Body() dto: OnboardingBankDto,
  ) {
    return this.onboardingService.submitBank(companyId, linkId, dto);
  }
}
