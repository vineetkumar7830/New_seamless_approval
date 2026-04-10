import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PayFrom extends Document {

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  payFrom: string;

  @Prop({ required: true })
  payAs: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  bankAccountId: string;

  @Prop({ required: true })
  payeeId: string;

  @Prop({ required: true })
  checkNumber: string;

  @Prop()
  payeeAccountNumber: string;

  @Prop()
  invoiceNumber: string;

  @Prop({ required: true })
  dateOfIssue: Date;

  @Prop()
  category: string;

  @Prop()
  memo: string;

  @Prop({ default: false })
  processWithout: boolean;
  @Prop({
    enum: ['save', 'send', 'print', 'direct-deposit'],
    default: 'save',
  })
  action: string;
  @Prop({
    enum: ['draft', 'sent', 'printed', 'deposited'],
    default: 'draft',
  })
  status: string;
}

export const PayFromSchema = SchemaFactory.createForClass(PayFrom);
