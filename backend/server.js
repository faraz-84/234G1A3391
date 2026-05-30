const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const logger = require('logging-middleware');

const { getAccessToken, clearTokenCache } = require('./utils/auth');
const { getPriorityNotifications } = require('./utils/priority');
const { mockNotifications } = require('./utils/mockData');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const TEST_SERVER_URL = process.env.TEST_SERVER_URL || 'http://4.224.186.213/evaluation-service';

app.use(cors());
app.use(express.json());

// Real-time log buffer for in-app console
const logBuffer = [];
function addLogToBuffer(stack, level, pkg, message) {
  logBuffer.push({
    timestamp: new Date().toISOString(),
    stack,
    level,
    package: pkg,
    message
  });
  if (logBuffer.length > 100) {
    logBuffer.shift();
  }
}

// Logger config injection middleware
async function loggingContextMiddleware(req, res, next) {
  try {
    const token = await getAccessToken();
    logger.configure({
      token,
      baseUrl: process.env.TEST_SERVER_URL || TEST_SERVER_URL
    });
    req.Log = async (stack, level, pkg, message) => {
      addLogToBuffer(stack, level, pkg, message);
      try {
        return await logger.Log(stack, level, pkg, message);
      } catch (err) {
        console.error('Failed to post log to external test server:', err.message);
      }
    };
    next();
  } catch (error) {
    console.error('Logger init failed:', error.message);
    req.Log = async (stack, level, pkg, msg) => {
      addLogToBuffer(stack, level, pkg, msg);
      console.log(`[FALLBACK] [${stack}] [${level}] [${pkg}] ${msg}`);
    };
    next();
  }
}

app.use(loggingContextMiddleware);

// Get student profile info
app.get('/api/profile', (req, res) => {
  res.status(200).json({
    name: process.env.FULL_NAME || 'Sabeel',
    rollNo: process.env.ROLL_NO || '234G1A3392',
    email: process.env.EMAIL || '234g1a3392@srit.ac.in'
  });
});

// Main notification endpoint
app.get('/api/notifications', async (req, res) => {
  const n = parseInt(req.query.n, 10) || 10;
  const readIdsQuery = req.query.readIds || '';
  const readIds = readIdsQuery ? readIdsQuery.split(',') : [];

  try {
    await req.Log('backend', 'info', 'route', `GET notifications limit=${n}`);

    const token = await getAccessToken();
    let notifications = [];

    if (token === 'mock-developer-token') {
      await req.Log('backend', 'info', 'service', 'Using fallback mock notification dataset');
      notifications = mockNotifications;
    } else {
      const response = await axios.get(`${TEST_SERVER_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });
      notifications = response.data?.notifications || [];
    }

    // Sort using priority rules
    const priorityList = getPriorityNotifications(notifications, n, readIds);
    await req.Log('backend', 'info', 'controller', `Returned ${priorityList.length} items`);

    res.status(200).json({
      success: true,
      count: priorityList.length,
      notifications: priorityList
    });

  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    await req.Log('backend', 'error', 'handler', `Fetch error: ${errMsg}`);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: errMsg
    });
  }
});

// Helper function to update .env file dynamic variables
function updateEnvFile(updates) {
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const lines = envContent.split(/\r?\n/);
  const envVars = {};
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const index = trimmed.indexOf('=');
      const key = trimmed.substring(0, index).trim();
      const val = trimmed.substring(index + 1).trim();
      envVars[key] = val;
    }
  });

  // Apply updates
  Object.keys(updates).forEach(key => {
    envVars[key] = updates[key];
    process.env[key] = updates[key]; // update in memory
  });

  // Re-write to .env
  const newContent = Object.keys(envVars)
    .map(key => `${key}=${envVars[key]}`)
    .join('\n');
  
  fs.writeFileSync(envPath, newContent, 'utf8');
}

// Get active configuration variables
app.get('/api/config', (req, res) => {
  res.status(200).json({
    TEST_SERVER_URL: process.env.TEST_SERVER_URL || 'http://4.224.186.213/evaluation-service',
    EMAIL: process.env.EMAIL || '',
    FULL_NAME: process.env.FULL_NAME || '',
    MOBILE_NO: process.env.MOBILE_NO || '',
    GITHUB_USERNAME: process.env.GITHUB_USERNAME || '',
    ROLL_NO: process.env.ROLL_NO || '',
    ACCESS_CODE: process.env.ACCESS_CODE || '',
    CLIENT_ID: process.env.CLIENT_ID || '',
    CLIENT_SECRET: process.env.CLIENT_SECRET ? '********' : '',
    hasClientCredentials: !!(process.env.CLIENT_ID && process.env.CLIENT_SECRET)
  });
});

// Update configuration variables
app.post('/api/config', async (req, res) => {
  try {
    const updates = req.body || {};
    updateEnvFile(updates);
    await req.Log('backend', 'info', 'config', 'Updated configurations via dashboard');
    res.status(200).json({ success: true, message: 'Configuration saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register dynamically with Affordmed Test Server
app.post('/api/register', async (req, res) => {
  const {
    TEST_SERVER_URL,
    EMAIL,
    FULL_NAME,
    MOBILE_NO,
    GITHUB_USERNAME,
    ROLL_NO,
    ACCESS_CODE
  } = process.env;

  if (!EMAIL || !ACCESS_CODE) {
    return res.status(400).json({
      success: false,
      message: 'Email and Access Code are required for registration'
    });
  }

  const payload = {
    email: EMAIL,
    name: FULL_NAME || 'Student',
    mobileNo: MOBILE_NO || '9999999999',
    githubUsername: GITHUB_USERNAME || 'student-github',
    rollNo: ROLL_NO || '234G1A3392',
    accessCode: ACCESS_CODE
  };

  const registerEndpoint = `${TEST_SERVER_URL || 'http://4.224.186.213/evaluation-service'}/register`;

  try {
    await req.Log('backend', 'info', 'auth', `Registering with test server at ${registerEndpoint}`);
    
    const response = await axios.post(registerEndpoint, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    const { clientID, clientSecret } = response.data;
    if (!clientID || !clientSecret) {
      throw new Error('Registration responded successfully but clientID or clientSecret was not returned');
    }

    updateEnvFile({
      CLIENT_ID: clientID,
      CLIENT_SECRET: clientSecret
    });

    clearTokenCache();

    await req.Log('backend', 'info', 'auth', 'Registered successfully. Saved credentials.');

    res.status(200).json({
      success: true,
      message: 'Registration successful! clientID and clientSecret saved.',
      data: response.data
    });
  } catch (error) {
    const errMsg = error.response?.data?.message || error.response?.data || error.message;
    await req.Log('backend', 'error', 'auth', `Registration failed: ${errMsg}`);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Registration failed',
      error: typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg
    });
  }
});

// Logs endpoint for the in-app terminal console
app.get('/api/logs', (req, res) => {
  res.status(200).json({
    success: true,
    logs: logBuffer
  });
});

// Logging proxy endpoint
app.post('/api/logs', async (req, res) => {
  const { stack, level, package: pkg, message } = req.body;
  try {
    const result = await req.Log(stack, level, pkg, message);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
