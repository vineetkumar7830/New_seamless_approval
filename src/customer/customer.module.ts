import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Customer, CustomerSchema } from '../schemas/customer.schema';
import { PayeeLink, PayeeLinkSchema } from '../schemas/payee-link.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: PayeeLink.name, schema: PayeeLinkSchema },
    ]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService, MongooseModule],
})
export class CustomerModule {}
