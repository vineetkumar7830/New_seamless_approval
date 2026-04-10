export interface CheckViewResponse {
  country: string;
  bankName: string;
  bankAddress: string;
  accountHolderName: string;
  checkNumber: number;
  routingNumber: string;
  maskedAccountNumber: string;
  micrLine: string;
  verificationStatus: string;
}
