import {
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional,
} from 'class-validator';

export class Step2Dto {
  @IsNotEmpty()
  @IsString()
  unique_id: string; // From step 1

  @IsOptional()
  @IsString()
  country_code?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[+]?[\d\s\-()]{7,15}$/, { message: 'phone must be valid' })
  phone: string;

  @IsOptional()
  @IsString()
  coupon_code?: string;
}
