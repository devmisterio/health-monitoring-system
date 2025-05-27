#!/usr/bin/env node

const { Command } = require('commander');
const config = require('./config/config');
const ResponderService = require('./services/responder');

const registerCommand = require('./commands/register');
const deregisterCommand = require('./commands/deregister');
const healthCommand = require('./commands/health');

const program = new Command();

// Global responder service instance
const responderService = new ResponderService();

// Global signal handlers
process.on('SIGINT', () => responderService.gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => responderService.gracefulShutdown('SIGTERM'));

program
  .name('responder')
  .description('CLI-based responder service for AIR Server')
  .version('1.0.0');

program
  .command('register')
  .description('Register responder with AIR Server')
  .option('-t, --token <token>', 'Authentication token')
  .option('-i, --ip <ip>', 'IP address of responder')
  .option('-o, --os <os>', 'Operating system information')
  .action((options) => registerCommand(options, responderService));

program
  .command('deregister')
  .description('Deregister responder from AIR Server')
  .option('-t, --token <token>', 'Authentication token')
  .option('-r, --responder-id <id>', 'Responder ID to deregister')
  .action((options) => deregisterCommand(options, responderService));

program
  .command('health')
  .description('Send health update to AIR Server')
  .option('-a, --auto', 'Enable automatic health updates')
  .option('-i, --interval <seconds>', 'Health update interval in seconds', config.healthInterval)
  .option('-r, --responder-id <id>', 'Responder ID for health updates')
  .action((options) => healthCommand(options, responderService));

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
