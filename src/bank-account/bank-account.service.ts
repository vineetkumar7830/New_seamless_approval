import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BankAccount, BankAccountDocument } from './entities/bank-account.entity';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';

import { throwException } from 'src/util/util/errorhandling';
import CustomError from 'src/provider/customer-error.service';
import CustomResponse from 'src/provider/custom-response.service';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectModel(BankAccount.name)
    private readonly bankModel: Model<BankAccountDocument>,
  ) { }

  // ================= CREATE =================
  async create(dto: CreateBankAccountDto, companyId: string): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing. Please relogin.');
      }

      if (dto.accountNumber !== dto.confirmAccountNumber) {
        throw new CustomError(400, 'Account number does not match');
      }
      const { companyId: _, ...bankData } = dto as any;

      const bank = await this.bankModel.create({
        ...bankData,
        companyId: new Types.ObjectId(companyId),
      });

      return new CustomResponse(
        201,
        'Bank account created successfully',
        bank,
      );
    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async getBank(companyId: string): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing. Please relogin.');
      }
      const bank = await this.bankModel.findOne({
        companyId: new Types.ObjectId(companyId),
      }).lean();

      if (!bank) {
        throw new CustomError(404, 'Bank account not found');
      }

      return new CustomResponse(
        200,
        'Bank account fetched successfully',
        bank,
      );
    } catch (error) {
      throwException(error);
      throw error;
    }
  }
}
