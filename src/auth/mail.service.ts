import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const secure = this.configService.get('MAIL_SECURE');
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: secure === true || secure === 'true',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false 
      }
    });
  }

  async sendOtp(to: string, otp: string) {
    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to,
      subject: 'Your Verification Code - New Seamless',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px;">
          <h2 style="color: #4A90E2;">Complete Your Registration</h2>
          <p>Hello,</p>
          <p>Thank you for signing up with <b>New Seamless</b>. Use the following OTP to verify your email address:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; text-align: center; border-radius: 5px; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #888;">&copy; 2024 New Seamless. All rights reserved.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP sent to ${to}`);
    } catch (error) {
      console.error(' Error sending email:', error);
      throw new Error('Failed to send verification email');
    }
  }
  async sendCheckEmail(to: string, checkDetails: any) {
    const { payFrom, amount, checkNumber, dateOfIssue, memo, payeeName } = checkDetails;
    const formattedDate = new Date(dateOfIssue).toLocaleDateString();

    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to,
      subject: `New Check Received - #${checkNumber}`,
      html: `
        <div style="font-family: 'Courier New', Courier, monospace; border: 2px solid #333; padding: 20px; width: 600px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 5px 5px 15px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <strong style="font-size: 18px;">${payFrom}</strong><br>
              <span style="font-size: 12px; color: #666;">Corporate Account</span>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 14px;">Date: ${formattedDate}</span><br>
              <span style="font-size: 16px; font-weight: bold; color: #d9534f;">No. ${checkNumber}</span>
            </div>
          </div>
          
          <div style="margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
            <span style="font-size: 14px;">PAY TO THE ORDER OF:</span>
            <span style="font-size: 18px; font-weight: bold; margin-left: 20px; border-bottom: 1px dashed #333; display: inline-block; width: 300px;">${payeeName}</span>
            <div style="float: right; border: 2px solid #333; padding: 5px 15px; font-size: 18px; font-weight: bold;">
              $ ${amount.toLocaleString()}
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <span style="font-size: 14px; text-transform: uppercase;">
              ${this.numberToWords(amount)} DOLLARS
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 40px; border-top: 1px solid #333; padding-top: 10px;">
            <div>
              <span style="font-size: 12px;">MEMO:</span>
              <span style="font-size: 14px; margin-left: 10px; font-style: italic;">${memo || 'N/A'}</span>
            </div>
            <div style="text-align: right;">
              <span style="font-family: 'Brush Script MT', cursive; font-size: 24px; border-bottom: 1px solid #333; display: inline-block; min-width: 200px;">
                Authorized Signature
              </span>
            </div>
          </div>

          <div style="margin-top: 30px; text-align: center; font-family: 'OCR-A', monospace; letter-spacing: 5px; color: #555;">
            ⑆000000000⑆ 0000000000⑈ ${checkNumber}
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Check Email sent to ${to}`);
    } catch (error) {
      console.error(' Error sending check email:', error);
      throw new Error('Failed to send check email');
    }
  }

  private numberToWords(num: number): string {
    // Simple mock for example, a real library would be better here
    return num.toString(); 
  }
}
