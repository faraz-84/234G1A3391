const axios = require('axios');

const STACKS = ['backend', 'frontend'];
const LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

const BACKEND_PACKAGES = [
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'handler',
  'repository',
  'route',
  'service'
];

const FRONTEND_PACKAGES = [
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style'
];

const SHARED_PACKAGES = [
  'auth',
  'config',
  'middleware',
  'utils'
];

let apiBaseUrl = 'http://4.224.186.213/evaluation-service';
let authToken = '';

// Configure token and baseURL for the logger instance
function configure(config = {}) {
  if (config.token) {
    authToken = config.token;
  }
  if (config.baseUrl) {
    apiBaseUrl = config.baseUrl;
  }
}

// Reusable Log function executing POST requests to the test server
async function Log(stack, level, pkg, message) {
  const lowerStack = String(stack).toLowerCase();
  const lowerLevel = String(level).toLowerCase();
  const lowerPkg = String(pkg).toLowerCase();

  // Basic validation checks
  if (!STACKS.includes(lowerStack)) {
    throw new Error(`Invalid stack: "${stack}". Allowed: ${STACKS.join(', ')}`);
  }

  if (!LEVELS.includes(lowerLevel)) {
    throw new Error(`Invalid level: "${level}". Allowed: ${LEVELS.join(', ')}`);
  }

  const isShared = SHARED_PACKAGES.includes(lowerPkg);
  const isValidBackendPkg = lowerStack === 'backend' && BACKEND_PACKAGES.includes(lowerPkg);
  const isValidFrontendPkg = lowerStack === 'frontend' && FRONTEND_PACKAGES.includes(lowerPkg);

  if (!isShared && !isValidBackendPkg && !isValidFrontendPkg) {
    const allowed = lowerStack === 'backend' 
      ? [...BACKEND_PACKAGES, ...SHARED_PACKAGES] 
      : [...FRONTEND_PACKAGES, ...SHARED_PACKAGES];
    throw new Error(`Invalid package "${pkg}" for stack "${stack}". Allowed: ${allowed.join(', ')}`);
  }

  if (!message || typeof message !== 'string') {
    throw new Error('Log message must be a non-empty string');
  }

  // Max length on test server is 48 chars. Autocut with suspension dots.
  let safeMessage = String(message);
  if (safeMessage.length > 48) {
    safeMessage = safeMessage.substring(0, 45) + '...';
  }

  const payload = {
    stack: lowerStack,
    level: lowerLevel,
    package: lowerPkg,
    message: safeMessage
  };

  try {
    const headers = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await axios.post(`${apiBaseUrl}/logs`, payload, {
      headers,
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    const errMsg = errorData 
      ? (typeof errorData === 'object' ? JSON.stringify(errorData) : errorData)
      : error.message;
    console.error(`[Logger Error] POST /logs failed: ${errMsg}`);
    throw new Error(`Failed to send log: ${errMsg}`);
  }
}

module.exports = {
  configure,
  Log
};
