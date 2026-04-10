// banking.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankingService } from './banking.service';
import { BankingController } from './banking.controller';
import { Bank, BankSchema } from './entities/banking.entity';
import { Routing, RoutingSchema } from './entities/routing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bank.name, schema: BankSchema },
      { name: Routing.name, schema: RoutingSchema },
    ]),
  ],
  controllers: [BankingController],
  providers: [BankingService],
})
export class BankingModule {}