import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreatePayeeDto } from './dto/create-payee.dto';
import { InviteLinkDto } from './dto/invite-link.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CompanyGuard } from '../common/guards/company.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@GetUser('companyId') companyId: string, @Body() dto: CreatePayeeDto) {
    return this.customerService.create(companyId, dto);
  }

  @Post('invite-link')
  generateLink(@GetUser('companyId') companyId: string, @Body() dto: InviteLinkDto) {
    return this.customerService.generateInviteLink(companyId, dto);
  }

  @Get()
  findAll(@GetUser('companyId') companyId: string) {
    return this.customerService.findAll(companyId);
  }

  @Get('dashboard')
  getDashboardStats(@GetUser('companyId') companyId: string) {
    return this.customerService.getDashboardStats(companyId);
  }

  @Get(':id')
  findOne(@GetUser('companyId') companyId: string, @Param('id') id: string) {
    return this.customerService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @GetUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@GetUser('companyId') companyId: string, @Param('id') id: string) {
    return this.customerService.remove(companyId, id);
  }
}
