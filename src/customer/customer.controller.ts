import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CompanyGuard } from '../common/guards/company.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('dashboard')
  getDashboardStats(@GetUser('companyId') companyId: string) {
    return this.customerService.getDashboardStats(companyId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @GetUser('companyId') companyId: string,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.customerService.create(companyId, createCustomerDto);
  }


  @Get()
  findAll(@GetUser('companyId') companyId: string) {
    return this.customerService.findAll(companyId);
  }


  @Get(':id')
  findOne(@GetUser('companyId') companyId: string, @Param('id') id: string) {
    return this.customerService.findOne(companyId, id);
  }

 
  @Patch(':id')
  update(
    @GetUser('companyId') companyId: string,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(companyId, id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@GetUser('companyId') companyId: string, @Param('id') id: string) {
    return this.customerService.remove(companyId, id);
  }
}
