import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PayFrom } from './entities/payfronm.entity';
import { CreatePayFromDto } from './dto/create-payfronm.dto';
import { UpdatePayFromActionDto } from './dto/update-payfronm.dto';
import { MailService } from 'src/auth/mail.service';
import { CustomerService } from 'src/customer/customer.service';
import { BankAccountService } from 'src/bank-account/bank-account.service';

@Injectable()
export class PayFromService {
  constructor(
    @InjectModel(PayFrom.name)
    private payFromModel: Model<PayFrom>,
    private mailService: MailService,
    private customerService: CustomerService,
    private bankAccountService: BankAccountService,
  ) {}

  async getDashboardStats(companyId: string) {
    const cId = new Types.ObjectId(companyId);

    const [totalPayments, statusCounts, totalAmount, recentPayments] = await Promise.all([
      this.payFromModel.countDocuments({ companyId: cId }),
      this.payFromModel.aggregate([
        { $match: { companyId: cId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.payFromModel.aggregate([
        { $match: { companyId: cId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.payFromModel.find({ companyId: cId }).sort({ createdAt: -1 }).limit(10),
    ]);

    const stats = {
      draft: 0,
      sent: 0,
      printed: 0,
      deposited: 0,
    };

    statusCounts.forEach((item) => {
      if (item._id in stats) {
        stats[item._id] = item.count;
      }
    });

    return {
      status: true,
      result: {
        totalPayments,
        stats,
        totalAmount: totalAmount[0]?.total || 0,
        recentPayments,
      },
    };
  }
  async create(dto: CreatePayFromDto, companyId: string) {
    const data = await this.payFromModel.create({
      ...dto,
      companyId: new Types.ObjectId(companyId),
      action: 'save',
      status: 'draft',
    });

    return {
      status: true,
      message: 'Payment saved successfully',
      result: data,
    };
  }

  async performAction(dto: UpdatePayFromActionDto, companyId: string) {
    const payment = await this.payFromModel.findOne({
      _id: dto.paymentId,
      companyId: new Types.ObjectId(companyId),
    });

    if (!payment) {
      return {
        status: false,
        message: 'Payment not found',
        result: null,
      };
    }

    payment.action = dto.action;

    if (dto.action === 'send') {
      if (!Types.ObjectId.isValid(payment.payeeId)) {
        return { status: false, message: 'Invalid Payee ID. Please use a valid Payee/Customer ID.' };
      }
      
      const payeeRes = await this.customerService.findOne(companyId, payment.payeeId);
      if (payeeRes.statusCode === 200 && payeeRes.result?.email) {
        await this.mailService.sendCheckEmail(payeeRes.result.email, {
          payFrom: payment.payFrom,
          payeeName: `${payeeRes.result.firstName} ${payeeRes.result.lastName}`,
          amount: payment.amount,
          checkNumber: payment.checkNumber,
          dateOfIssue: payment.dateOfIssue,
          memo: payment.memo,
        });
        payment.status = 'sent';
      } else {
        return { status: false, message: 'Payee email not found' };
      }
    }

    if (dto.action === 'print') {
      payment.status = 'printed';
      await payment.save();
      return {
        status: true,
        message: 'Payment ready for printing',
        result: {
          payment,
          printLayout: '<html>...</html>',
        },
      };
    }

    if (dto.action === 'direct-deposit') {
      payment.status = 'deposited';
    }

    await payment.save();

    return {
      status: true,
      message: `Payment ${dto.action} successfully`,
      result: payment,
    };
  }

  async getAll(companyId: string) {
    const data = await this.payFromModel
      .find({ companyId: new Types.ObjectId(companyId) })
      .sort({ createdAt: -1 });

    return {
      status: true,
      message: 'Payment list fetched',
      result: data,
    };
  }
}
