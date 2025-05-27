const dotenv = require('dotenv');
const os = require('os');

dotenv.config();

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // Docker container'da öncelikle custom network IP'sini ara (172.20.x.x)
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Custom responder network subnet'ini kontrol et
        if (iface.address.startsWith('172.20.')) {
          return iface.address;
        }
      }
    }
  }
  
  // Fallback: herhangi bir external IPv4
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return '127.0.0.1';
}

function getOSInfo() {
  return `${os.type()} ${os.release()}`;
}

const config = {
  airServerUrl: process.env.AIR_SERVER_URL || 'http://localhost:3000/api',
  token: process.env.RESPONDER_TOKEN || '',
  ip: process.env.RESPONDER_IP || getLocalIP(),
  operatingSystem: process.env.RESPONDER_OS || getOSInfo(),
  healthInterval: parseInt(process.env.HEALTH_INTERVAL) || 45,
  logLevel: process.env.LOG_LEVEL || 'info'
};

module.exports = config;