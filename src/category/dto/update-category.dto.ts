import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['income', 'expense'])
  type?: 'income' | 'expense';
}
