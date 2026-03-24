import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { FilterCompaniesDto } from './dto/filter-companies.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CompanyStatus } from '../schemas/company.schema';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto);
  }
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('companies')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getCompanies(@Query() query: FilterCompaniesDto) {
    return this.adminService.getCompanies(query.status as CompanyStatus);
  }

  @Patch('companies/:id/approve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  approveCompany(@Param('id') id: string) {
    return this.adminService.approveCompany(id);
  }


  @Patch('companies/:id/reject')
  @UseGuards(JwtAuthGuard, AdminGuard)
  rejectCompany(@Param('id') id: string) {
    return this.adminService.rejectCompany(id);
  }
}
