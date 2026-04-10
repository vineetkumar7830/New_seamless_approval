import { IsIn, IsNotEmpty, IsMongoId } from 'class-validator';

export class UpdatePayFromActionDto {

  @IsMongoId({ message: 'paymentId must be a valid MongoDB ObjectID' })
  @IsNotEmpty()
  paymentId: string;

  @IsIn(['send', 'print', 'direct-deposit'])
  action: string;
}