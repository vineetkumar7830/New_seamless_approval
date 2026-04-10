import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

import { Customer, CustomerDocument, CustomerStatus } from '../schemas/customer.schema';
import { PayeeLink, PayeeLinkDocument } from '../schemas/payee-link.schema';
import { Company, CompanyDocument } from '../schemas/company.schema';
import { OnboardingDetailsDto } from './dto/onboarding-details.dto';
import { OnboardingBankDto } from './dto/onboarding-bank.dto';

import { throwException } from 'src/util/util/errorhandling';
import CustomError from 'src/provider/customer-error.service';
import CustomResponse from 'src/provider/custom-response.service';

@Injectable()
export class PayeeOnboardingService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(PayeeLink.name) private linkModel: Model<PayeeLinkDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private jwtService: JwtService,
  ) {}

  async validateToken(token: string): Promise<CustomResponse> {
    try {

      const link = await this.linkModel.findOne({
        token,
        expiresAt: { $gt: new Date() },
      });

      if (!link) {
        throw new CustomError(404, 'Invalid or expired onboarding link.');
      }

      const company = await this.companyModel.findById(link.companyId);

      const payload = {
        sub: (link.companyId as any).toString(),
        linkId: (link._id as any).toString(),
        role: 'onboarding',
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });

      return new CustomResponse(
        200,
        'Onboarding link validated successfully',
        {
          accessToken,
          companyId: (link.companyId as any).toString(),
          companyName: company?.name || 'Our Company',
          email: link.tempEmail,          // ← jiss email se link bani, wahi automatically aayegi
          payeeType: link.payeeType || 'customer',
          requestBankDetails: link.requestBankDetails,
          expiresAt: link.expiresAt,
        },
      );

    } catch (error) {
      throwException(error);
      throw error;
    }
  } 
  
  async submitDetails(
    companyId: string,
    linkId: string | undefined,
    dto: OnboardingDetailsDto,
  ): Promise<CustomResponse> {
    try {

      if (!companyId) {
        throw new CustomError(401, 'Company context missing');
      }

      // Auto-fill email and payeeType from PayeeLink
      // Priority 1: linkId from JWT → find exact link
      // Priority 2: companyId → find latest active link for this company
      // Email always comes from PayeeLink — frontend never sends it
      let resolvedEmail: string | undefined = undefined;
      let resolvedPayeeType: string = 'customer';

      if (linkId) {
        const link = await this.linkModel.findById(linkId);
        if (link && link.tempEmail) {
          resolvedEmail = link.tempEmail;
          resolvedPayeeType = link.payeeType || 'customer';
        }
      }

      if (!resolvedEmail && companyId) {
        const link = await this.linkModel.findOne({
          companyId: new Types.ObjectId(companyId),
          expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        if (link && link.tempEmail) {
          resolvedEmail = link.tempEmail;
          resolvedPayeeType = link.payeeType || 'customer';
        }
      }

      if (!resolvedEmail) {
        throw new CustomError(400, 'Email could not be resolved. Please use a valid invite link.');
      }

      let customer = await this.customerModel.findOne({
        email: resolvedEmail.toLowerCase(),
        companyId: new Types.ObjectId(companyId),
        status: CustomerStatus.PENDING_ONBOARDING,
      });

      if (customer) {
        Object.assign(customer, { ...dto, email: resolvedEmail.toLowerCase(), payeeType: resolvedPayeeType });
        await customer.save();
      } else {
        customer = await this.customerModel.create({
          ...dto,
          email: resolvedEmail.toLowerCase(),
          companyId: new Types.ObjectId(companyId),
          status: CustomerStatus.PENDING_ONBOARDING,
          payeeType: resolvedPayeeType,
        });
      }

      return new CustomResponse(
        200,
        'Payee details saved successfully',
        {
          companyId: companyId,
          customerId: customer._id,
          email: resolvedEmail,
          payeeType: resolvedPayeeType,
        },
      );

    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async submitBank(
    companyId: string,
    linkId: string | undefined,
    dto: OnboardingBankDto,
  ): Promise<CustomResponse> {
    try {

      if (!companyId) {
        throw new CustomError(401, 'Company context missing');
      }

      if (dto.accountNumber !== dto.confirmAccountNumber) {
        throw new CustomError(400, 'Account numbers do not match');
      }

      const customer = await this.customerModel.findOne({
        companyId: new Types.ObjectId(companyId),
        status: CustomerStatus.PENDING_ONBOARDING,
      }).sort({ updatedAt: -1 });

      if (!customer) {
        throw new CustomError(
          404,
          'Payee details not found. Please complete details first.',
        );
      }

      customer.bankDetails = {
        holderName: dto.holderName,
        routingNumber: dto.routingNumber,
        accountNumber: dto.accountNumber,
        accountType: dto.accountType,
        addWireInfo: dto.addWireInfo || false,
      };

      customer.status = CustomerStatus.ACTIVE;

      await customer.save();

      if (linkId) {
        await this.linkModel.deleteOne({
          _id: new Types.ObjectId(linkId),
        });
      }

      return new CustomResponse(
        200,
        'Bank details saved and onboarding complete!',
        {
          companyId: companyId,
          customer,
        },
      );

    } catch (error) {
      throwException(error);
      throw error;
    }
  }
}