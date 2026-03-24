import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class RegisterCompanyDto {
  @IsOptional()
  @IsString()
  unique_id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  confirm_password: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[+]?[\d\s\-()]{7,15}$/, {
    message: 'phone must be a valid phone number',
  })
  phone: string;

  @IsOptional()
  @IsBoolean()
  email_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  phone_verified?: boolean;

  @IsOptional()
  @IsString()
  country_code?: string;

  @IsOptional()
  @IsString()
  coupon_code?: string;

  @IsOptional()
  @IsBoolean()
  terms_accepted?: boolean;

  @IsOptional()
  @IsBoolean()
  privacy_accepted?: boolean;

  @IsOptional()
  @IsBoolean()
  communication_accepted?: boolean;

  @IsOptional()
  @IsString()
  business_legal_name?: string;

  @IsOptional()
  @IsString()
  address_line_1?: string;

  @IsOptional()
  @IsString()
  address_line_2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  entity_type?: string;

  @IsOptional()
  @IsString()
  dba?: string;

  @IsOptional()
  @IsDateString()
  formation_date?: string;

  @IsOptional()
  @IsString()
  industry_type?: string;

  @IsOptional()
  @IsString()
  ein?: string;

  @IsOptional()
  @IsDateString()
  trial_start?: string;

  @IsOptional()
  @IsDateString()
  trial_end?: string;
}
