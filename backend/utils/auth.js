const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

let cachedToken = null;
let tokenExpiry = null;

// Get access token with in-memory caching
async function getAccessToken() {
  const now = Date.now();
  
  if (cachedToken && tokenExpiry && now < (tokenExpiry - 30000)) {
    return cachedToken;
  }

  const {
    TEST_SERVER_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    FULL_NAME,
    EMAIL,
    ROLL_NO,
    ACCESS_CODE
  } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return 'mock-developer-token';
  }

  const authUrl = `${TEST_SERVER_URL || 'http://4.224.186.213/evaluation-service'}/auth`;

  const payload = {
    companyName: 'Affordmed',
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    email: EMAIL,
    name: FULL_NAME,
    rollNo: ROLL_NO,
    accessCode: ACCESS_CODE
  };

  try {
    const response = await axios.post(authUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const { access_token, expires_in } = response.data;
    if (!access_token) {
      throw new Error('Auth response missing access_token');
    }

    cachedToken = access_token;
    const expiresInSeconds = expires_in || 3600;
    tokenExpiry = Date.now() + (expiresInSeconds * 1000);

    return cachedToken;
  } catch (error) {
    const errMsg = error.response?.data?.message || error.response?.data || error.message;
    throw new Error(`Auth failed: ${typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg}`);
  }
}

function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = null;
}

module.exports = {
  getAccessToken,
  clearTokenCache
};

