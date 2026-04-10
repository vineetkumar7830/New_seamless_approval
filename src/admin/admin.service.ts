import {
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { Admin, AdminDocument } from '../schemas/admin.schema';
import { Company, CompanyDocument, CompanyStatus } from '../schemas/company.schema';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { AdminLoginDto } from './dto/admin-login.dto';

import { throwException } from 'src/util/util/errorhandling';
import CustomError from 'src/provider/customer-error.service';
import CustomResponse from 'src/provider/custom-response.service';
import { sendEmail } from 'src/util/util/mailerutil';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'vineetvineet8006@gmail.com';
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || 'Vineet@11';
    const adminName = this.configService.get<string>('ADMIN_NAME') || ' Admin';

    const existing = await this.adminModel.findOne({ email: adminEmail });
    if (!existing) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await this.adminModel.create({
        name: adminName,
        email: adminEmail,
        password: hashed,
      });
      console.log(` Default admin seeded: ${adminEmail}`);
    }
  }

  async login(dto: AdminLoginDto): Promise<CustomResponse> {
    try {

      const admin = await this.adminModel.findOne({ email: dto.email.toLowerCase() });

      if (!admin) {
        throw new CustomError(401, 'Invalid admin credentials');
      }

      const isMatch = await bcrypt.compare(dto.password, admin.password);

      if (!isMatch) {
        throw new CustomError(401, 'Invalid admin credentials');
      }

      const payload = {
        sub: (admin._id as any).toString(),
        email: admin.email,
        role: 'admin',
      };

      const token = this.jwtService.sign(payload);

      return new CustomResponse(
        200,
        'Admin login successful',
        {
          accessToken: token,
          admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
          },
        },
      );

    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async getCompanies(status?: CompanyStatus): Promise<CustomResponse> {
    try {

      const filter = status ? { status } : {};

      const companies = await this.companyModel
        .find(filter)
        .select('-password')
        .sort({ createdAt: -1 });

      return new CustomResponse(
        200,
        'Companies fetched successfully',
        {
          total: companies.length,
          companies,
        },
      );

    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async approveCompany(id: string): Promise<CustomResponse> {
    try {

      const company = await this.companyModel.findById(id);

      if (!company) {
        throw new CustomError(404, 'Company not found');
      }

      if (company.status === CompanyStatus.APPROVED) {
        throw new CustomError(400, 'Company is already approved');
      }

      company.status = CompanyStatus.APPROVED;
      await company.save();
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
      const loginUrl = `${frontendUrl}/login`;
      
      const subject = 'Congratulations! Your account on New Seamless has been approved';
      const text = `Hi ${company.name},\n\nYour account on New Seamless has been approved. You can now log in and start managing your payees.\n\nLog in here: ${loginUrl}\n\nBest regards,\nThe Seamless Team`;
      
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Approved</title>
</head>
<body style="margin: 0; padding: 40px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Accent -->
          <tr>
            <td style="background-color: #22c55e; height: 8px;"></td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <img src="https://hiverift.com/assets/7fe77d5a1d2e3ea35cd92869801d704f0f2dbc95-Db0tIUYg.png" alt="Seamless" style="height: 48px; border: 0;">
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #f0fdf4; border-radius: 50%; padding: 16px; margin-bottom: 16px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1e293b;">Account Approved!</h2>
              </div>
              
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #475569; text-align: center;">
                Hi <span style="font-weight: 600; color: #1e293b;">${company.name}</span>,
              </p>
              
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #475569; text-align: center;">
                We're excited to inform you that your application for <strong>New Seamless</strong> has been approved. 
                Your account is now fully active and ready for use.
              </p>

              <!-- Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #22c55e; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.2);">
                      Log In to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <div style="border-top: 1px solid #e2e8f0; padding-top: 32px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #64748b; text-align: center;">
                  Best regards,<br>
                  <span style="font-weight: 600; color: #334155;">The Seamless Team</span><br>
                  <span style="font-size: 12px;">Powered by Hive Rift</span>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Need help? <a href="mailto:support@seamless.co" style="color: #22c55e; text-decoration: none; font-weight: 500;">Contact Support</a><br>
                &copy; 2024 Seamless Check Writer. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

      try {
        await sendEmail(company.email, subject, text, html);
      } catch (error) {
        console.error('Failed to send approval email:', error);
      }

      return new CustomResponse(
        200,
        'Company approved successfully',
        company,
      );

    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async rejectCompany(id: string): Promise<CustomResponse> {
    try {

      const company = await this.companyModel.findById(id);

      if (!company) {
        throw new CustomError(404, 'Company not found');
      }

      if (company.status === CompanyStatus.REJECTED) {
        throw new CustomError(400, 'Company is already rejected');
      }

      company.status = CompanyStatus.REJECTED;
      await company.save();

      const subject = 'Update on your New Seamless account registration';
      const text = `Hi ${company.name},\n\nThank you for your interest in New Seamless. After reviewing your application, we regret to inform you that we cannot approve your account at this time.\n\nIf you have any questions, please reach out to our support team.\n\nBest regards,\nThe Seamless Team`;
      
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Update</title>
</head>
<body style="margin: 0; padding: 40px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Accent -->
          <tr>
            <td style="background-color: #64748b; height: 8px;"></td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <img src="https://hiverift.com/assets/7fe77d5a1d2e3ea35cd92869801d704f0f2dbc95-Db0tIUYg.png" alt="Seamless" style="height: 48px; border: 0;">
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #f1f5f9; border-radius: 50%; padding: 16px; margin-bottom: 16px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1e293b;">Registration Update</h2>
              </div>
              
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #475569; text-align: center;">
                Hi <span style="font-weight: 600; color: #1e293b;">${company.name}</span>,
              </p>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569; text-align: center;">
                Thank you for your interest in <strong>New Seamless</strong>. 
                After carefully reviewing your application, we regret to inform you that we are unable to approve your account at this time.
              </p>

              <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.6; color: #64748b; text-align: center; background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px dashed #e2e8f0;">
                If you believe this was a mistake or would like to provide more information, 
                please click the button below to reach out to our team.
              </p>

              <!-- Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="mailto:support@seamless.co" target="_blank" style="display: inline-block; background-color: #334155; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 32px; border-radius: 8px;">
                      Contact Support Team
                    </a>
                  </td>
                </tr>
              </table>

              <div style="border-top: 1px solid #e2e8f0; padding-top: 32px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #64748b; text-align: center;">
                  Best regards,<br>
                  <span style="font-weight: 600; color: #334155;">The Seamless Team</span><br>
                  <span style="font-size: 12px;">Powered by Hive Rift</span>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                &copy; 2024 Seamless Check Writer. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

      try {
        await sendEmail(company.email, subject, text, html);
      } catch (error) {
        console.error('Failed to send rejection email:', error);
      }

      return new CustomResponse(
        200,
        'Company rejected successfully',
        company,
      );

    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async getDashboard(): Promise<CustomResponse> {
    try {

      const [
        totalCompanies,
        pendingCompanies,
        approvedCompanies,
        rejectedCompanies,
        totalCustomers,
      ] = await Promise.all([
        this.companyModel.countDocuments(),
        this.companyModel.countDocuments({ status: CompanyStatus.PENDING }),
        this.companyModel.countDocuments({ status: CompanyStatus.APPROVED }),
        this.companyModel.countDocuments({ status: CompanyStatus.REJECTED }),
        this.customerModel.countDocuments(),
      ]);

      return new CustomResponse(
        200,
        'Dashboard stats fetched successfully',
        {
          stats: {
            totalCompanies,
            pendingCompanies,
            approvedCompanies,
            rejectedCompanies,
            totalCustomers,
          },
        },
      );

    } catch (error) {
      throwException(error);
      throw error;
    }
  }
}