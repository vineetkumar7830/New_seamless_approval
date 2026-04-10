import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateCategoryDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn(['income', 'expense'])
  type: 'income' | 'expense';
}
