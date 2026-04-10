import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankAccountService } from './bank-account.service';
import { BankAccountController } from './bank-account.controller';
import {
  BankAccount,
  BankAccountSchema,
} from './entities/bank-account.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BankAccount.name,
        schema: BankAccountSchema,
      },
    ]),
  ],
  controllers: [BankAccountController],
  providers: [BankAccountService],
  exports: [BankAccountService], 
})
export class BankAccountModule {}
