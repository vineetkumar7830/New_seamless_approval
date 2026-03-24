import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async create(companyId: string, dto: CreateCustomerDto) {
    const customer = await this.customerModel.create({
      companyId: new Types.ObjectId(companyId),
      ...dto,
    });

    return {
      message: 'Customer created successfully',
      customer,
    };
  }

  async findAll(companyId: string) {
    const customers = await this.customerModel
      .find({ companyId: new Types.ObjectId(companyId) })
      .sort({ createdAt: -1 });

    return {
      total: customers.length,
      customers,
    };
  }

  async findOne(companyId: string, id: string) {
    const customer = await this.customerModel.findOne({
      _id: id,
      companyId: new Types.ObjectId(companyId),
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return { customer };
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    const customer = await this.customerModel.findOneAndUpdate(
      { _id: id, companyId: new Types.ObjectId(companyId) },
      { $set: dto },
      { new: true },
    );

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
      message: 'Customer updated successfully',
      customer,
    };
  }

  async remove(companyId: string, id: string) {
    const customer = await this.customerModel.findOneAndDelete({
      _id: id,
      companyId: new Types.ObjectId(companyId),
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
      message: 'Customer deleted successfully',
    };
  }

  async getDashboardStats(companyId: string) {
    const [totalCustomers, recentCustomers] = await Promise.all([
      this.customerModel.countDocuments({ companyId: new Types.ObjectId(companyId) }),
      this.customerModel
        .find({ companyId: new Types.ObjectId(companyId) })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email phone createdAt'),
    ]);

    return {
      stats: {
        totalCustomers,
      },
      recentCustomers,
    };
  }
}
