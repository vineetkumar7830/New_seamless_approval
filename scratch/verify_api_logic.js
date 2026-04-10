const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env'));

async function testFix() {
  const routingNumber = '121000248';
  const apiKey = envConfig.RAPIDAPI_KEY;
  const apiHost = envConfig.RAPIDAPI_ROUTING_HOST;

  console.log(`Using API Host: ${apiHost}`);
  
  const options = {
    method: 'GET',
    url: `https://${apiHost}/api/v1/${routingNumber}`,
    params: { format: 'json', paymentType: 'ach' },
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': apiHost,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await axios.request(options);
    const data = response.data[0].data;
    console.log('Mapping Test:');
    console.log('Bank Name:', data.name);
    console.log('Street:', data.street || data.addressFull);
    console.log('City:', data.city);
    console.log('State:', data.state);
    console.log('Zip:', data.zip);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFix();
