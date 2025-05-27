const config = require('../config/config');
const { log } = require('../utils/logger');
const { makeRequest } = require('./api');
const { saveState, clearState, loadState } = require('./state');

class ResponderService {
  constructor() {
    this.responderId = null;
    this.responderToken = null;
    this.healthInterval = null;
    this.isShuttingDown = false;
    this.loadExistingState();
  }

  loadExistingState() {
    const state = loadState();
    if (state) {
      this.responderId = state.responderId;
      this.responderToken = state.responderToken;
    }
  }

  setResponderData(responderId, responderToken) {
    this.responderId = responderId;
    this.responderToken = responderToken;
  }

  async register(token, ip, operatingSystem) {
    const data = {
      token: token || config.token,
      ipAddress: ip || config.ip,
      os: operatingSystem || config.operatingSystem
    };

    log('info', 'Registering responder...', { ip: data.ipAddress, os: data.os });

    const response = await makeRequest('POST', 'register', data);
    this.responderId = response.id;
    this.responderToken = data.token;
    saveState(this.responderId, this.responderToken);

    log('info', 'Responder registered successfully', { responderId: this.responderId });
    return response;
  }

  async deregister(token) {
    if (!this.responderId) {
      log('warn', 'No responder ID found. May not be registered.');
      return;
    }

    const data = {
      responderId: this.responderId,
      token: token || config.token
    };

    log('info', 'Deregistering responder...', { responderId: this.responderId });

    await makeRequest('DELETE', 'deregister', data);

    log('info', 'Responder deregistered successfully');
    this.responderId = null;
    this.responderToken = null;
    clearState();
  }

  async sendHealthUpdate() {
    if (!this.responderId) {
      log('warn', 'Cannot send health update: not registered');
      return;
    }

    const data = {
      responderId: this.responderId,
      token: this.responderToken || config.token
    };
  
    return await makeRequest('POST', 'health', data);
  }

  startHealthMonitoring(intervalSeconds = config.healthInterval) {
    const interval = intervalSeconds * 1000;
    log('info', `Starting automatic health updates every ${intervalSeconds} seconds`);

    this.healthInterval = setInterval(async () => {
      try {
        await this.sendHealthUpdate();
      } catch (error) {
        log('error', 'Health update failed', error.message);
      }
    }, interval);

    log('info', 'Health monitoring started. Press Ctrl+C to stop.');
  }

  stopHealthMonitoring() {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
    }
  }

  async gracefulShutdown(signal) {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    log('info', `Received ${signal}. Shutting down gracefully...`);

    this.stopHealthMonitoring();

    try {
      if (this.responderId) {
        await this.deregister();
      }
    } catch (error) {
      log('error', 'Error during graceful shutdown', error.message);
    }

    process.exit(0);
  }
}

module.exports = ResponderService;