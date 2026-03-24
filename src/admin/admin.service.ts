import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
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

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

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

  async login(dto: AdminLoginDto) {
    const admin = await this.adminModel.findOne({ email: dto.email.toLowerCase() });
    if (!admin) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const payload = {
      sub: (admin._id as any).toString(),
      email: admin.email,
      role: 'admin',
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Admin login successful',
      accessToken: token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    };
  }

  async getCompanies(status?: CompanyStatus) {
    const filter = status ? { status } : {};
    const companies = await this.companyModel
      .find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    return {
      total: companies.length,
      companies,
    };
  }

  async approveCompany(id: string) {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    if (company.status === CompanyStatus.APPROVED) {
      throw new BadRequestException('Company is already approved');
    }

    company.status = CompanyStatus.APPROVED;
    await company.save();

    return {
      message: 'Company approved successfully',
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        status: company.status,
      },
    };
  }

  async rejectCompany(id: string) {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    if (company.status === CompanyStatus.REJECTED) {
      throw new BadRequestException('Company is already rejected');
    }

    company.status = CompanyStatus.REJECTED;
    await company.save();

    return {
      message: 'Company rejected',
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        status: company.status,
      },
    };
  }

  async getDashboard() {
    const [totalCompanies, pendingCompanies, approvedCompanies, rejectedCompanies, totalCustomers] =
      await Promise.all([
        this.companyModel.countDocuments(),
        this.companyModel.countDocuments({ status: CompanyStatus.PENDING }),
        this.companyModel.countDocuments({ status: CompanyStatus.APPROVED }),
        this.companyModel.countDocuments({ status: CompanyStatus.REJECTED }),
        this.customerModel.countDocuments(),
      ]);

    return {
      stats: {
        totalCompanies,
        pendingCompanies,
        approvedCompanies,
        rejectedCompanies,
        totalCustomers,
      },
    };
  }
}
