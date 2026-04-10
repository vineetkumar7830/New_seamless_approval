import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Company, CompanyDocument, CompanyStatus } from '../schemas/company.schema';
import { Step1Dto } from './dto/step1.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Step2Dto } from './dto/step2.dto';
import { Step3Dto } from './dto/step3.dto';
import { Step4Dto } from './dto/step4.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from './mail.service';
import { SendPhoneOtpDto } from './dto/send-phone-otp.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';

import { throwException } from 'src/util/util/errorhandling';
import CustomError from 'src/provider/customer-error.service';
import CustomResponse from 'src/provider/custom-response.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async registerStep1(dto: Step1Dto): Promise<CustomResponse> {
    try {
      const { password, confirm_password, ...rest } = dto;

      if (password !== confirm_password) {
        throw new CustomError(400, 'Passwords do not match');
      }

      const existing = await this.companyModel.findOne({ email: rest.email.toLowerCase() });

      if (existing && existing.status !== CompanyStatus.DRAFT) {
        throw new CustomError(409, 'A company with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date();
      otpExpires.setMinutes(otpExpires.getMinutes() + 10);

      let company: CompanyDocument;

      if (existing && existing.status === CompanyStatus.DRAFT) {
        company = existing;
        Object.assign(company, rest);
        company.password = hashedPassword;
        company.email_otp = otp;
        company.email_otp_expires = otpExpires;
        await company.save();
      } else {
        company = await this.companyModel.create({
          ...rest,
          email: rest.email.toLowerCase(),
          password: hashedPassword,
          status: CompanyStatus.DRAFT,
          email_otp: otp,
          email_otp_expires: otpExpires,
          email_verified: false,
          phone_verified: false,
        });
      }

      await this.mailService.sendOtp(company.email, otp);

      return new CustomResponse(200, 'Step 1 completed', company);

    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<CustomResponse> {
    try {
      const { unique_id, otp } = dto;

      const company = await this.companyModel.findOne({ unique_id, status: CompanyStatus.DRAFT });

      if (!company) {
        throw new CustomError(404, 'Registration session not found.');
      }

      if (company.email_otp !== otp) {
        throw new CustomError(400, 'Invalid verification code.');
      }

      if (!company.email_otp_expires || new Date() > company.email_otp_expires) {
        throw new CustomError(400, 'Verification code has expired.');
      }

      company.email_verified = true;
      company.email_otp = undefined;
      company.email_otp_expires = undefined;

      await company.save();

      return new CustomResponse(200, 'Email verified successfully', company);

    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async sendPhoneOtp(dto: SendPhoneOtpDto): Promise<CustomResponse> {
    try {
      const { unique_id, phone } = dto;

      const company = await this.companyModel.findOne({ unique_id, status: CompanyStatus.DRAFT });

      if (!company) {
        throw new CustomError(404, 'Registration session not found.');
      }

      const staticOtp = '1234';
      const otpExpires = new Date();
      otpExpires.setMinutes(otpExpires.getMinutes() + 10);

      company.phone = phone;
      company.phone_otp = staticOtp;
      company.phone_otp_expires = otpExpires;

      await company.save();

      return new CustomResponse(200, 'Phone OTP sent', { otp: staticOtp });

    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async verifyPhoneOtp(dto: VerifyPhoneOtpDto): Promise<CustomResponse> {
    try {
      const { unique_id, otp } = dto;

      const company = await this.companyModel.findOne({ unique_id, status: CompanyStatus.DRAFT });

      if (!company) {
        throw new CustomError(404, 'Registration session not found.');
      }

      if (company.phone_otp !== otp) {
        throw new CustomError(400, 'Invalid verification code.');
      }

      if (!company.phone_otp_expires || new Date() > company.phone_otp_expires) {
        throw new CustomError(400, 'Verification code has expired.');
      }

      company.phone_verified = true;
      company.phone_otp = undefined;
      company.phone_otp_expires = undefined;

      await company.save();

      return new CustomResponse(200, 'Phone verified successfully', company);

    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async registerStep2(dto: Step2Dto): Promise<CustomResponse> {
    try {
      const { unique_id, ...rest } = dto;

      const company = await this.companyModel.findOne({ unique_id, status: CompanyStatus.DRAFT });

      if (!company) {
        throw new CustomError(404, 'Registration session not found.');
      }

      if (!company.email_verified) {
        throw new CustomError(403, 'Please verify your email OTP first.');
      }

      if (!company.phone_verified) {
        throw new CustomError(403, 'Please verify your phone OTP first.');
      }

      Object.assign(company, rest);
      await company.save();

      return new CustomResponse(200, 'Step 2 completed successfully', company);

    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async registerStep3(dto: Step3Dto): Promise<CustomResponse> {
    try {
      const { unique_id, ...rest } = dto;

      const company = await this.companyModel.findOne({ unique_id, status: CompanyStatus.DRAFT });

      if (!company) {
        throw new CustomError(404, 'Registration session not found.');
      }

      Object.assign(company, rest);
      await company.save();

      return new CustomResponse(200, 'Step 3 completed successfully', company);

    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async registerStep4(dto: Step4Dto): Promise<CustomResponse> {
    try {
      const { unique_id, ...rest } = dto;

      const company = await this.companyModel.findOne({ unique_id, status: CompanyStatus.DRAFT });

      if (!company) {
        throw new CustomError(404, 'Registration session not found.');
      }

      if (!company.email_verified || !company.phone_verified) {
        throw new CustomError(403, 'Please complete email and phone verification first.');
      }

      Object.assign(company, rest);
      company.status = CompanyStatus.PENDING;

      await company.save();

      return new CustomResponse(200, 'Registration successful', company);

    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<CustomResponse> {
    try {
      const { email, password } = dto;

      const company = await this.companyModel.findOne({ email: email.toLowerCase() });

      if (!company) {
        throw new CustomError(401, 'Invalid email or password');
      }

      const isMatch = await bcrypt.compare(password, company.password);

      if (!isMatch) {
        throw new CustomError(401, 'Invalid email or password');
      }

      if (company.status === CompanyStatus.DRAFT) {
        throw new CustomError(403, 'Your registration is incomplete.');
      }

      if (company.status === CompanyStatus.PENDING) {
        throw new CustomError(403, 'Your account is pending admin approval.');
      }

      if (company.status === CompanyStatus.REJECTED) {
        throw new CustomError(403, 'Your account has been rejected.');
      }

      const token = this.jwtService.sign({
        sub: (company._id as any).toString(),
        email: company.email,
        role: 'company',
      });

      return new CustomResponse(200, 'Login successful', {
        accessToken: token,
        company,
      });

    } catch (error) {
      throwException(error);
      throw error;
    }
  }
}