import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class OnboardingBankDto {
  @IsNotEmpty()
  @IsString()
  holderName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{9}$/, { message: 'routingNumber must be a 9-digit number' })
  routingNumber: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{8,17}$/, { message: 'accountNumber should be between 8 and 17 digits' })
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  confirmAccountNumber: string;

  @IsNotEmpty()
  @IsString()
  accountType: string;

  @IsOptional()
  @IsBoolean()
  addWireInfo?: boolean;
}
