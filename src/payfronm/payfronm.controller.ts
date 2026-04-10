import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { PayFromService } from './payfronm.service';
import { CreatePayFromDto } from './dto/create-payfronm.dto';
import { UpdatePayFromActionDto } from './dto/update-payfronm.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('payfrom')
@UseGuards(JwtAuthGuard)
export class PayFromController {
  constructor(private readonly service: PayFromService) {}

  @Post('save')
  save(@GetUser('companyId') companyId: string, @Body() dto: CreatePayFromDto) {
    return this.service.create(dto, companyId);
  }

  @Post('action')
  action(@GetUser('companyId') companyId: string, @Body() dto: UpdatePayFromActionDto) {
    return this.service.performAction(dto, companyId);
  }
  
  @Get('list')
  getAll(@GetUser('companyId') companyId: string) {
    return this.service.getAll(companyId);
  }
}
