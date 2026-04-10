import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

export enum CustomerStatus {
  ACTIVE = 'active',
  PENDING_ONBOARDING = 'pending_onboarding',
}

@Schema({ timestamps: true })
export class Customer {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['customer', 'vendor', 'employee'],
    default: 'customer',
  })
  payeeType: string;

  @Prop({ trim: true })
  payeeName: string;

  @Prop({ trim: true })
  nickName: string;

  @Prop({ lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true })
  payeeId: string; 

  @Prop({ trim: true })
  entityType: string;

  @Prop({ trim: true })
  companyName: string;

  @Prop({ default: false })
  requestBankDetails: boolean;

  @Prop({ trim: true })
  firstName: string;

  @Prop({ trim: true })
  lastName: string;

  @Prop({ trim: true })
  addressLine1: string;

  @Prop({ trim: true })
  addressLine2: string;

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  state: string;

  @Prop({ trim: true })
  country: string;

  @Prop({ trim: true })
  zip: string;

  @Prop({
    type: {
      holderName: String,
      routingNumber: String,
      accountNumber: String,
      accountType: String,
      addWireInfo: Boolean,
    },
    _id: false,
  })
  bankDetails?: {
    holderName: string;
    routingNumber: string;
    accountNumber: string;
    accountType: string;
    addWireInfo: boolean;
  };

  @Prop({
    type: String,
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
