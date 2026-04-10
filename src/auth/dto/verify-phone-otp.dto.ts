import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class VerifyPhoneOtpDto {
  @IsNotEmpty()
  @IsString()
  unique_id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  otp: string;
}
