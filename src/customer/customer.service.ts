import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { Customer, CustomerDocument, CustomerStatus } from '../schemas/customer.schema';
import { PayeeLink, PayeeLinkDocument } from '../schemas/payee-link.schema';
import { CreatePayeeDto } from './dto/create-payee.dto';
import { InviteLinkDto } from './dto/invite-link.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { throwException } from 'src/util/util/errorhandling';
import CustomError from 'src/provider/customer-error.service';
import CustomResponse from 'src/provider/custom-response.service';
import { sendEmail } from 'src/util/util/mailerutil';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(PayeeLink.name) private linkModel: Model<PayeeLinkDocument>,
    private configService: ConfigService,
  ) {}

  async create(companyId: string, dto: CreatePayeeDto): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing');
      }

      const customer = await this.customerModel.create({
        companyId: new Types.ObjectId(companyId),
        ...dto,
        status: CustomerStatus.ACTIVE,
      });

      return new CustomResponse(201, 'Payee added successfully', customer);
    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async generateInviteLink(companyId: string, dto: InviteLinkDto): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing');
      }

      const link = await this.linkModel.create({
        companyId: new Types.ObjectId(companyId),
        tempEmail: dto.email,
        requestBankDetails: dto.requestBankDetails || false,
        payeeType: dto.payeeType || 'customer',
      });

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
      const shareUrl = `${frontendUrl}/s/pf/${link.token}`;

      if (dto.email) {
        const subject = 'Action Required: Provide Your Payee Details';
        const text = `Hello,\n\nYou have been invited. Please click the following link to proceed:\n${shareUrl}\n\nThank you!`;
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Request</title>
</head>
<body style="margin: 0; padding: 40px 0; background-color: #f2fbf5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f2fbf5;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1f2937;">Hi</h2>
              
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #4b5563;">
                Hive Rift has requested to add you as a payee to send payments. 
                To receive payments electronically, please provide your details 
                using the secure link below:
              </p>

              <!-- Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${shareUrl}" target="_blank" style="display: inline-block; background-color: #22c55e; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
                      Click Here to Submit Details
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px; font-size: 12px; color: #6b7280; text-align: center;">
                Your data is protected, and the link expires in 15 minutes.
              </p>

              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                Best regards,<br>
                <span style="font-weight: 500;">Seamless Check Writer</span><br>
                Powered by Hive Rift
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #bbf7d0; padding: 16px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #14532d;">
                For further queries contact: 
                <a href="mailto:support@seamlesscheckwriter.com" style="color: #14532d; text-decoration: underline;">
                  support@seamlesscheckwriter.com
                </a><br>
                Or (408) 775-7720
              </p>
            </td>
          </tr>

          <!-- Branding -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <img src="https://hiverift.com/assets/7fe77d5a1d2e3ea35cd92869801d704f0f2dbc95-Db0tIUYg.png" alt="Hive Rift" style="height: 40px; border: 0; outline: none; text-decoration: none;">
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
        try {
          await sendEmail(dto.email, subject, text, html);
        } catch (emailError) {
          console.error('Failed to send invite email:', emailError);
        }
      }

      return new CustomResponse(201, 'Invite link generated successfully', {
        companyId: companyId,
        shareUrl,
        token: link.token,
        tempData: {
          email: link.tempEmail,
        },
      });
    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async findAll(companyId: string): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing');
      }

      const customers = await this.customerModel
        .find({ companyId: new Types.ObjectId(companyId) })
        .sort({ createdAt: -1 });

      return new CustomResponse(200, 'Customers fetched successfully', {
        total: customers.length,
        customers,
      });
    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async findOne(companyId: string, id: string): Promise<CustomResponse> {
    try {
      const customer = await this.customerModel.findOne({
        _id: id,
        companyId: new Types.ObjectId(companyId),
      });

      if (!customer) {
        throw new CustomError(404, 'Customer not found');
      }

      return new CustomResponse(200, 'Customer fetched successfully', customer);
    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto): Promise<CustomResponse> {
    try {
      const customer = await this.customerModel.findOneAndUpdate(
        { _id: id, companyId: new Types.ObjectId(companyId) },
        { $set: dto },
        { new: true },
      );

      if (!customer) {
        throw new CustomError(404, 'Customer not found');
      }

      return new CustomResponse(200, 'Customer updated successfully', customer);
    } catch (error) {
      throwException(error);
      throw error;
    }
  }
  async remove(companyId: string, id: string): Promise<CustomResponse> {
    try {
      const customer = await this.customerModel.findOneAndDelete({
        _id: id,
        companyId: new Types.ObjectId(companyId),
      });

      if (!customer) {
        throw new CustomError(404, 'Customer not found');
      }

      return new CustomResponse(200, 'Customer deleted successfully', null);
    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async getDashboardStats(companyId: string): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing');
      }

      const [totalCustomers, recentCustomers] = await Promise.all([
        this.customerModel.countDocuments({
          companyId: new Types.ObjectId(companyId),
        }),
        this.customerModel
          .find({ companyId: new Types.ObjectId(companyId) })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('firstName lastName email phone createdAt'),
      ]);

      return new CustomResponse(200, 'Dashboard stats fetched successfully', {
        stats: {
          totalCustomers,
        },
        recentCustomers,
      });
    } catch (error) {
      throwException(error);
      throw error;
    }
  }
}