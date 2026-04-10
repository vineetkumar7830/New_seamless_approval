const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../src/app.module');
const { BankingService } = require('../src/banking/banking.service');

async function testService() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const bankingService = app.get(BankingService);

  const routingNumber = '121000248'; 
  try {
    console.log(`Testing lookup for: ${routingNumber}`);
    const result = await bankingService.getRoutingDetails(routingNumber);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await app.close();
  }
}

testService();
