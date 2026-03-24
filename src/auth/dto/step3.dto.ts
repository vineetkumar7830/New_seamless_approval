import {
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class Step3Dto {
  @IsNotEmpty()
  @IsString()
  unique_id: string; // From step 1

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
}
