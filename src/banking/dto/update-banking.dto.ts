import { PartialType } from '@nestjs/mapped-types';
import { CreateBankDto } from './create-banking.dto';

export class UpdateBankingDto extends PartialType(CreateBankDto) {}
