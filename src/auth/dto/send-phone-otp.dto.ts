import { IsNotEmpty, IsString } from 'class-validator';

export class SendPhoneOtpDto {
  @IsNotEmpty()
  @IsString()
  unique_id: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}
