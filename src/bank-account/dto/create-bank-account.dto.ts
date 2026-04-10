import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateBankAccountDto {

  @IsString()
  @IsNotEmpty()
  routingNumber: string;

  @IsString()
  @Length(6, 20)
  accountNumber: string;

  @IsString()
  @Length(6, 20)
  confirmAccountNumber: string;

  @IsString()
  @IsNotEmpty()
  nameOnAccount: string;

  @IsString()
  @IsNotEmpty()
  nickName: string;

  @IsString()
  @IsNotEmpty()
  addressLine1: string;
}
