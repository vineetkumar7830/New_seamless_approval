import { IsEnum, IsOptional } from 'class-validator';
import { CompanyStatus } from '../../schemas/company.schema';

export class FilterCompaniesDto {
  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;
}
