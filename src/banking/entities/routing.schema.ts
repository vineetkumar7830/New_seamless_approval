// schemas/routing.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoutingDocument = Routing & Document;

@Schema()
export class Routing {
  @Prop({ unique: true })
  routingNumber: string;

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

export const RoutingSchema = SchemaFactory.createForClass(Routing);