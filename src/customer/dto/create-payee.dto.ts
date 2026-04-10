import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';

export class CreatePayeeDto {
  @IsNotEmpty()
  @IsString()
  payeeName: string;

  @IsNotEmpty()
  @IsString()
  nickName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  payeeId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsBoolean()
  requestBankDetails?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['customer', 'vendor', 'employee'])
  payeeType?: string;
}
