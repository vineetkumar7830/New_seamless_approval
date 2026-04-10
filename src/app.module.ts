import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CustomerModule } from './customer/customer.module';
import { PayeeOnboardingModule } from './payee-onboarding/payee-onboarding.module';
import { BankAccountModule } from './bank-account/bank-account.module';
import { PayFromModule } from './payfronm/payfronm.module';
import { CategoryModule } from './category/category.module';
import { BankingModule } from './banking/banking.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    AdminModule,
    CustomerModule,
    PayeeOnboardingModule,
    BankAccountModule,
    PayFromModule,
    CategoryModule,
    BankingModule
  ],
})
export class AppModule {}
