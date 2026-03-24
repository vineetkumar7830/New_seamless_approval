import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as crypto from 'crypto';

export type CompanyDocument = Company & Document;

export enum CompanyStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
@Schema({ timestamps: true })
@Schema({ timestamps: true })
export class Company {
  @Prop({ default: () => crypto.randomUUID() })
  unique_id: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ default: false })
  email_verified: boolean;

  @Prop({ default: false })
  phone_verified: boolean;

  @Prop({ trim: true })
  country_code: string;

  @Prop({ trim: true })
  coupon_code: string;

  @Prop({ default: false })
  terms_accepted: boolean;

  @Prop({ default: false })
  privacy_accepted: boolean;

  @Prop({ default: false })
  communication_accepted: boolean;

  @Prop({ trim: true })
  business_legal_name: string;

  @Prop({ trim: true })
  address_line_1: string;

  @Prop({ trim: true })
  address_line_2: string;

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  state: string;

  @Prop({ trim: true })
  zip: string;

  @Prop({ trim: true })
  country: string;

  @Prop({ trim: true })
  entity_type: string;

  @Prop({ trim: true })
  dba: string;

  @Prop({ trim: true })
  formation_date: string;

  @Prop({ trim: true })
  industry_type: string;

  @Prop({ trim: true })
  ein: string;

  @Prop({ type: Date })
  trial_start: Date;

  @Prop({ type: Date })
  trial_end: Date;

  @Prop({ trim: true })
  email_otp?: string;

  @Prop({ type: Date })
  email_otp_expires?: Date;

  @Prop({
    type: String,
    enum: CompanyStatus,
    default: CompanyStatus.PENDING,
  })
  status: CompanyStatus;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
