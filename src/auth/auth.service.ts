import {
  Injectable,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  // STEP 1: Signup & Send OTP
  async registerStep1(dto: Step1Dto) {
    const { password, confirm_password, ...rest } = dto;

    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.companyModel.findOne({ email: rest.email.toLowerCase() });
    
    if (existing && existing.status !== CompanyStatus.DRAFT) {
      throw new ConflictException('A company with this email already exists');
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
      const companyData: any = {
        ...rest,
        email: rest.email.toLowerCase(),
        password: hashedPassword,
        status: CompanyStatus.DRAFT,
        email_otp: otp,
        email_otp_expires: otpExpires,
      };
      company = await this.companyModel.create(companyData);
    }

    await this.mailService.sendOtp(company.email, otp);

    return {
      message: 'Step 1 completed. Please check your email for the verification code.',
      unique_id: company.unique_id,
    };
  }

  // NEW STEP: Verify OTP ONLY
  async verifyOtp(dto: VerifyOtpDto) {
    const { unique_id, otp } = dto;
    const company = await this.companyModel.findOne({ unique_id, status: CompanyStatus.DRAFT });
    
    if (!company) {
      throw new NotFoundException('Registration session not found.');
    }

    if (company.email_otp !== otp) {
      throw new BadRequestException('Invalid verification code.');
    }

    if (!company.email_otp_expires || new Date() > company.email_otp_expires) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    company.email_verified = true;
    company.email_otp = undefined; 
    company.email_otp_expires = undefined;
    await company.save();

    return {
      message: 'Email verified successfully. You can now proceed to step 2.',
      unique_id: company.unique_id,
    };
  }

  // STEP 2: Add Phone & Coupon (after OTP)
  async registerStep2(dto: Step2Dto) {
    const { unique_id, ...rest } = dto;
    const company = await this.companyModel.findOne({ unique_id, status: CompanyStatus.DRAFT });
    
    if (!company) {
      throw new NotFoundException('Registration session not found.');
    }

    if (!company.email_verified) {
      throw new ForbiddenException('Please verify your email OTP first.');
    }

    company.phone = rest.phone;
    if (rest.country_code) company.country_code = rest.country_code;
    if (rest.coupon_code) company.coupon_code = rest.coupon_code;
    
    company.phone_verified = true; // Still static as requested

    await company.save();

    return {
      message: 'Step 2 completed successfully. Phone added.',
      unique_id: company.unique_id,
    };
  }

  // STEP 3: Address Details
  async registerStep3(dto: Step3Dto) {
    const { unique_id, ...rest } = dto;
    const company = await this.companyModel.findOne({ unique_id, status: CompanyStatus.DRAFT });
    
    if (!company) {
      throw new NotFoundException('Registration session not found.');
    }

    if (!company.email_verified) {
      throw new ForbiddenException('Please verify your email first.');
    }

    Object.assign(company, rest);
    await company.save();

    return {
      message: 'Step 3 completed successfully',
      unique_id: company.unique_id,
    };
  }

  // STEP 4: Business Details & Submit
  async registerStep4(dto: Step4Dto) {
    const { unique_id, ...rest } = dto;
    const company = await this.companyModel.findOne({ unique_id, status: CompanyStatus.DRAFT });
    
    if (!company) {
      throw new NotFoundException('Registration session not found.');
    }

    if (!company.email_verified) {
      throw new ForbiddenException('Please verify your email first.');
    }

    Object.assign(company, rest);
    
    company.status = CompanyStatus.PENDING; 
    await company.save();

    return {
      message: 'Registration successful! Your account is pending admin approval.',
      unique_id: company.unique_id,
      companyId: company._id,
      email: company.email,
      status: company.status,
    };
  }

  // LOGIN
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const company = await this.companyModel.findOne({ email: email.toLowerCase() });
    if (!company) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (company.status === CompanyStatus.DRAFT) {
      throw new ForbiddenException('Your registration is incomplete. Please finish the registration steps.');
    }

    if (company.status === CompanyStatus.PENDING) {
      throw new ForbiddenException('Your account is pending admin approval. Please wait.');
    }

    if (company.status === CompanyStatus.REJECTED) {
      throw new ForbiddenException('Your account has been rejected. Please contact support.');
    }

    const payload = {
      sub: (company._id as any).toString(),
      email: company.email,
      role: 'company',
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      accessToken: token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        status: company.status,
      },
    };
  }
}
