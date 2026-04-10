// schemas/bank.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BankDocument = Bank & Document;

@Schema({ timestamps: true })
export class Bank {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  accountNo: string;

  @Prop({ required: true })
  routingNumber: string;

  @Prop()
  accountType: string;

  @Prop()
  nickName: string;

  @Prop()
  checkNo: string;

  @Prop()
  fractionalNo: string;

  @Prop()
  bankName: string;

  @Prop()
  streetAddress: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  zip: string;
}

export const BankSchema = SchemaFactory.createForClass(Bank);