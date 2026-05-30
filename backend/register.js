const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const {
  TEST_SERVER_URL,
  EMAIL,
  FULL_NAME,
  MOBILE_NO,
  GITHUB_USERNAME,
  ROLL_NO,
  ACCESS_CODE
} = process.env;

async function runRegistration() {
  console.log('Starting registration with the Affordmed Test Server...');

  // Validate that user has modified placeholder values
  if (!EMAIL || EMAIL.includes('your-university-email') || EMAIL.includes('example.edu')) {
    console.error('ERROR: Please set a valid EMAIL in your .env file before registering.');
    process.exit(1);
  }
  if (!ACCESS_CODE || ACCESS_CODE === 'yourAccessCodeFromEmail') {
    console.error('ERROR: Please set your ACCESS_CODE from your email in the .env file before registering.');
    process.exit(1);
  }

  const payload = {
    email: EMAIL,
    name: FULL_NAME,
    mobileNo: MOBILE_NO,
    githubUsername: GITHUB_USERNAME,
    rollNo: ROLL_NO,
    accessCode: ACCESS_CODE
  };

  const registerEndpoint = `${TEST_SERVER_URL || 'http://4.224.186.213/evaluation-service'}/register`;

  console.log(`Sending POST request to ${registerEndpoint}...`);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(registerEndpoint, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\nRegistration Success!');
    console.log('Response Details:', response.data);

    const { clientID, clientSecret } = response.data;

    if (!clientID || !clientSecret) {
      console.error('WARNING: Server did not return clientID or clientSecret. Check the response.');
      return;
    }

    // Read the current .env file and replace/update the client credentials
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update CLIENT_ID
    if (envContent.includes('CLIENT_ID=')) {
      envContent = envContent.replace(/CLIENT_ID=.*/, `CLIENT_ID=${clientID}`);
    } else {
      envContent += `\nCLIENT_ID=${clientID}`;
    }

    // Update CLIENT_SECRET
    if (envContent.includes('CLIENT_SECRET=')) {
      envContent = envContent.replace(/CLIENT_SECRET=.*/, `CLIENT_SECRET=${clientSecret}`);
    } else {
      envContent += `\nCLIENT_SECRET=${clientSecret}`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('\nSUCCESS: Registered successfully. Client credentials saved to .env file.');

  } catch (error) {
    const errMsg = error.response?.data?.message || error.response?.data || error.message;
    console.error('\nERROR: Registration failed.');
    console.error(`Reason: ${errMsg}`);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

runRegistration();
