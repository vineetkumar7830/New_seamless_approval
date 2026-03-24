import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class Step4Dto {
  @IsNotEmpty()
  @IsString()
  unique_id: string; // From step 1

  @IsOptional()
  @IsString()
  business_legal_name?: string;

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
}
