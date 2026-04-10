import { IsEmail, IsOptional, IsString, IsBoolean, IsObject, IsIn } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  payeeName?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  nickName?: string;

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

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsOptional()
  @IsObject()
  bankDetails?: {
    holderName?: string;
    routingNumber?: string;
    accountNumber?: string;
    accountType?: string;
    addWireInfo?: boolean;
  };

  @IsOptional()
  @IsString()
  status?: string;
}
