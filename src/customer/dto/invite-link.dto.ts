import { IsEmail, IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';

export class InviteLinkDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  requestBankDetails?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['customer', 'vendor', 'employee'])
  payeeType?: string;
}
