import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('bank-account')
@UseGuards(JwtAuthGuard)
export class BankAccountController {
  constructor(private readonly service: BankAccountService) { }

  @Post()
  create(@GetUser('companyId') companyId: string, @Body() createBankAccountDto: CreateBankAccountDto) {
    return this.service.create(createBankAccountDto, companyId);
  }

  @Get()
  getBank(@GetUser('companyId') companyId: string) {
    return this.service.getBank(companyId);
  }
}
