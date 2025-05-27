const { log } = require('../utils/logger');
const config = require('../config/config');

async function healthCommand(options, responderService) {
  try {
    if (options.responderId) {
      responderService.setResponderData(options.responderId, null);
    }

    // If not registered, auto-register first
    if (!responderService.responderId) {
      log('info', 'Not registered, registering first...');
      await responderService.register();
    }

    if (options.auto) {
      const interval = parseInt(options.interval) || config.healthInterval;
      
      await responderService.sendHealthUpdate();
      responderService.startHealthMonitoring(interval);

      await new Promise(() => {});
    } else {
      await responderService.sendHealthUpdate();
      process.exit(0);
    }
  } catch (error) {
    log('error', 'Health update failed', error.message);
    process.exit(1);
  }
}

module.exports = healthCommand;