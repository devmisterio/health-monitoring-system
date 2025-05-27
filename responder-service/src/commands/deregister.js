const { log } = require('../utils/logger');

async function deregisterCommand(options, responderService) {
  try {
    if (options.responderId) {
      responderService.setResponderData(options.responderId, null);
    }
    await responderService.deregister(options.token);
    process.exit(0);
  } catch (error) {
    log('error', 'Deregistration failed', error.message);
    process.exit(1);
  }
}

module.exports = deregisterCommand;