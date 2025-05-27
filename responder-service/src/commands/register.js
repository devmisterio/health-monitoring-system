const { log } = require('../utils/logger');

async function registerCommand(options, responderService) {
  try {
    await responderService.register(options.token, options.ip, options.os);
    process.exit(0);
  } catch (error) {
    log('error', 'Registration failed', error.message);
    process.exit(1);
  }
}

module.exports = registerCommand;