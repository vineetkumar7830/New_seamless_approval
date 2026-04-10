import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class OnboardingDetailsDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z\s]+$/, { message: 'firstName should only contain alphabets' })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z\s]+$/, { message: 'lastName should only contain alphabets' })
  lastName: string;

  @IsOptional()
  @IsString()
  nickName?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[+]?[\d\s\-()]{7,15}$/, { message: 'phone must be a valid phone number' })
  phone: string;

  @IsOptional()
  @IsString()
  payeeId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  companyName?: string;


  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  zip: string;
}
