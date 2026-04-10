import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayeeOnboardingService } from './payee-onboarding.service';
import { PayeeOnboardingController } from './payee-onboarding.controller';
import { Customer, CustomerSchema } from '../schemas/customer.schema';
import { PayeeLink, PayeeLinkSchema } from '../schemas/payee-link.schema';
import { Company, CompanySchema } from '../schemas/company.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: PayeeLink.name, schema: PayeeLinkSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
    AuthModule,
  ],

  controllers: [PayeeOnboardingController],
  providers: [PayeeOnboardingService],
})
export class PayeeOnboardingModule {}
