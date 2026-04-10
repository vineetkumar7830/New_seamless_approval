import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayFromController } from './payfronm.controller';
import { PayFromService } from './payfronm.service';
import { PayFrom, PayFromSchema } from './entities/payfronm.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CustomerModule } from 'src/customer/customer.module';
import { BankAccountModule } from 'src/bank-account/bank-account.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PayFrom.name, schema: PayFromSchema },
    ]),
    AuthModule,
    CustomerModule,
    BankAccountModule,
  ],
  controllers: [PayFromController],
  providers: [PayFromService],
})
export class PayFromModule {}
