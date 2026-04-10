import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsMongoId,
} from 'class-validator';

export class CreatePayFromDto {

  @IsString()
  @IsNotEmpty()
  payFrom: string;

  @IsString()
  @IsNotEmpty()
  payAs: string;

  @IsNumber()
  amount: number;

  @IsMongoId({ message: 'bankAccountId must be a valid MongoDB ObjectID' })
  bankAccountId: string;

  @IsMongoId({ message: 'payeeId must be a valid MongoDB ObjectID' })
  payeeId: string;

  @IsString()
  @IsNotEmpty()
  checkNumber: string;

  @IsString()
  payeeAccountNumber: string;

  @IsString()
  invoiceNumber: string;

  @IsDateString()
  dateOfIssue: Date;

  @IsString()
  category: string;

  @IsString()
  memo: string;

  @IsBoolean()
  processWithout: boolean;
}
