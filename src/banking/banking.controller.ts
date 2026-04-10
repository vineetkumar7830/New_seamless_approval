import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BankingService } from './banking.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('banking')
@UseGuards(JwtAuthGuard)
export class BankingController {
  constructor(private readonly service: BankingService) {}

  @Post('routing')
  addRouting(@Body() body) {
    return this.service.addRouting(body);
  }

  @Post()
  async create(
    @Body() body,
    @GetUser('companyId') companyId: string,
  ) {
    if (body.routingNumber) {
      try {
        const routingRes =
          await this.service.getRoutingDetails(body.routingNumber);

        const routingDetails = routingRes.result;

        body.bankName = body.bankName || routingDetails.bankName;
        body.streetAddress =
          body.streetAddress || routingDetails.streetAddress;
        body.city = body.city || routingDetails.city;
        body.state = body.state || routingDetails.state;
        body.zip = body.zip || routingDetails.zip;
      } catch (error) {
      }
    }

    return this.service.create(body, companyId);
  }

  @Get()
  findAll(@GetUser('companyId') companyId: string) {
    return this.service.findAll(companyId);
  }

  @Get('routing/:routingNumber')
  getRouting(@Param('routingNumber') routingNumber: string) {
    return this.service.getRoutingDetails(routingNumber);
  }
}