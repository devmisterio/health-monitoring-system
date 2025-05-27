const config = require('../config/config');

function log(level, message, data = {}) {
  if (config.logLevel === 'debug' || level !== 'debug') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`,
      Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : '');
  }
}

module.exports = { log };