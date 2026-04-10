import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class Step4Dto {
  @IsNotEmpty()
  @IsString()
  unique_id: string;

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
  @IsString()
  formation_date?: string;

  @IsOptional()
  @IsString()
  industry_type?: string;

  @IsOptional()
  @IsString()
  ein?: string;

  @IsOptional()
  @IsBoolean()
  terms_accepted?: boolean;

  @IsOptional()
  @IsBoolean()
  privacy_accepted?: boolean;

  @IsOptional()
  @IsBoolean()
  communication_accepted?: boolean;
}
