import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BankAccountDocument = BankAccount & Document;

@Schema({ timestamps: true })
export class BankAccount {

  @Prop({ required: true })
  routingNumber: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  confirmAccountNumber: string;

  @Prop({ required: true })
  nameOnAccount: string;

  @Prop({ required: true })
  nickName: string;

  @Prop({ required: true })
  addressLine1: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  companyId: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);
