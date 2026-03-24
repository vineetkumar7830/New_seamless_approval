import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  unique_id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp: string;
}
