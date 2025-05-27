const axios = require('axios');
const { randomBytes } = require('crypto');
const config = require('../config/config');
const { log } = require('../utils/logger');

// Create a persistent HTTP agent with connection pooling and keep-alive
const http = require('http');
const https = require('https');

// Shared configuration for connection pooling and keep-alive
const agentConfig = {
  keepAlive: true,
  maxSockets: 5,        // Max concurrent connections per host
  maxFreeSockets: 2,    // Keep 2 idle connections open
  timeout: 60000        // 60-second timeout
};

const httpAgent = new http.Agent(agentConfig);
const httpsAgent = new https.Agent(agentConfig);

// Configure axios defaults for connection reuse
axios.defaults.httpAgent = httpAgent;
axios.defaults.httpsAgent = httpsAgent;
axios.defaults.timeout = 30000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, endpoint, data = null, maxRetries = 3) {
  const url = `${config.airServerUrl}/${endpoint}`;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const axiosConfig = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': randomBytes(8).toString('hex')
        }
      };

      if (data) {
        axiosConfig.data = data;
      }

      const response = await axios(axiosConfig);

      if (attempt > 0) {
        log('info', `Request succeeded after ${attempt} retries`);
      }

      return response.data;
    } catch (error) {
      lastError = error;

      if (error.response) {
        const status = error.response.status;

        if (status >= 400 && status < 500 && status !== 429 && status !== 408) {
          log('error', `API Error (no retry): ${status} - ${error.response.statusText}`,
              error.response.data);
          throw error;
        }

        log('warn', `API Error (attempt ${attempt + 1}/${maxRetries + 1}): ${status} - ${error.response.statusText}`,
            error.response.data);
      } else {
        log('warn', `Network Error (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}`);
      }

      if (attempt === maxRetries) {
        if (error.response) {
          log('error', `API Error after ${maxRetries} retries: ${error.response.status} - ${error.response.statusText}`,
              error.response.data);
        } else {
          log('error', `Network Error after ${maxRetries} retries: ${error.message}`);
        }
        throw error;
      }

      const baseDelay = 1000;
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.1 * delay;
      const totalDelay = delay + jitter;

      await sleep(totalDelay);
    }
  }

  throw lastError;
}

module.exports = { makeRequest };
