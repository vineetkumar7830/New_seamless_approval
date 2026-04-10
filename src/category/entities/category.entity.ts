import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {

  @Prop({ type: Types.ObjectId, required: true, index: true })
  companyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ['income', 'expense'] })
  type: 'income' | 'expense';

  @Prop({ default: true })
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
