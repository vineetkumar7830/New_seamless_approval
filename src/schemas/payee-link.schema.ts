import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as crypto from 'crypto';

export type PayeeLinkDocument = PayeeLink & Document;

@Schema({ timestamps: true })
export class PayeeLink {
  @Prop({ default: () => crypto.randomBytes(32).toString('hex'), unique: true })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;
  
  @Prop({ trim: true })
  tempEmail?: string;

  @Prop({ trim: true })
  tempPhone?: string;

  @Prop({ default: false })
  requestBankDetails: boolean;

  @Prop({
    type: String,
    enum: ['customer', 'vendor', 'employee'],
    default: 'customer',
  })
  payeeType: string;

  @Prop({
    type: Date,
    default: () => {
      const date = new Date();
      date.setMinutes(date.getMinutes() + 15); 
      return date;
    },
  })
  expiresAt: Date;
}

export const PayeeLinkSchema = SchemaFactory.createForClass(PayeeLink);
