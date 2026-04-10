import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bank, BankDocument } from './entities/banking.entity';
import { Routing, RoutingDocument } from './entities/routing.schema';
import { Model, Types } from 'mongoose';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { throwException } from 'src/util/util/errorhandling';
import CustomError from 'src/provider/customer-error.service';
import CustomResponse from 'src/provider/custom-response.service';

@Injectable()
export class BankingService {
  constructor(
    @InjectModel(Bank.name)
    private bankModel: Model<BankDocument>,

    @InjectModel(Routing.name)
    private routingModel: Model<RoutingDocument>,

    private configService: ConfigService,
  ) {}

  private isValidRoutingNumber(rn: string): boolean {
    if (!/^\d{9}$/.test(rn)) return false;

    const d = rn.split('').map(Number);

    const checksum =
      3 * (d[0] + d[3] + d[6]) +
      7 * (d[1] + d[4] + d[7]) +
      (d[2] + d[5] + d[8]);

    return checksum % 10 === 0;
  }

  async create(data: any, companyId: string): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing. Please relogin.');
      }

      const bank = await this.bankModel.create({
        ...data,
        companyId: new Types.ObjectId(companyId),
      });

      return new CustomResponse(201, 'Bank created successfully', bank);
    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async findAll(companyId: string): Promise<CustomResponse> {
    try {
      if (!companyId) {
        throw new CustomError(401, 'Company context missing. Please relogin.');
      }

      const banks = await this.bankModel
        .find({ companyId: new Types.ObjectId(companyId) })
        .lean();

      return new CustomResponse(200, 'Bank list fetched successfully', banks);
    } catch (error) {
      throwException(error);
      throw error;
    }
  }
  async getRoutingDetails(routingNumber: string): Promise<CustomResponse> {
    try {
      if (!routingNumber) {
        throw new CustomError(400, 'Routing number is required');
      }

      if (!this.isValidRoutingNumber(routingNumber)) {
        throw new CustomError(400, 'Invalid routing number');
      }

      const local = await this.routingModel
        .findOne({ routingNumber })
        .lean();

      if (local) {
        return new CustomResponse(200, 'Routing fetched from DB', local);
      }

      const apiKey = this.configService.get<string>('RAPIDAPI_KEY');
      const apiHost = this.configService.get<string>('RAPIDAPI_ROUTING_HOST');

      const options = {
        method: 'GET',
        url: `https://${apiHost}/api/v1/${routingNumber}`,
        params: { format: 'json', paymentType: 'ach' },
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': apiHost,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      };

      const response = await axios.request(options);

      if (
        !response.data ||
        !Array.isArray(response.data) ||
        response.data.length === 0 ||
        response.data[0].status !== 'success'
      ) {
        throw new CustomError(404, 'Routing number details not found');
      }

      const apiData = response.data[0].data;

      const routingData = {
        routingNumber,
        bankName: apiData.name || 'Unknown Bank',
        streetAddress: apiData.street || apiData.addressFull || '',
        city: apiData.city || 'Unknown',
        state: apiData.state || 'US',
        zip: apiData.zip || '',
      };

      await this.routingModel.create(routingData);

      return new CustomResponse(200, 'Routing fetched from API', routingData);
    } catch (error) {
      throwException(error);
      throw error;
    }
  }

  async addRouting(data: any): Promise<CustomResponse> {
    try {
      const routing = await this.routingModel.create(data);

      return new CustomResponse(201, 'Routing added successfully', routing);
    } catch (error) {
      throwException(error);
      throw error;
    }
  }
}