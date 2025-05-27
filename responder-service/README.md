# Responder Service

## Overview

A Node.js CLI application that registers with AIR Server and sends health updates.

---

## Features

### CLI Commands
- Registration and deregistration with AIR Server
- Manual and automatic health updates
- Commander.js for command handling

### State Management
- JSON file persistence for responder state
- Environment variable configuration
- Basic error handling

---

## Technology Stack

- **Node.js**: Runtime
- **Commander.js**: CLI framework
- **Axios**: HTTP client with keep-alive connections
- **Native Modules**: `os`, `fs` for system info

---

## CLI Commands

```bash
# Register with AIR Server
node src/cli.js register

# Send health update  
node src/cli.js health

# Start continuous health monitoring
node src/cli.js health --auto

# Deregister from AIR Server
node src/cli.js deregister
```

---

## Architecture

- **CLI Layer**: Command handling with Commander.js
- **Service Layer**: Business logic for registration and health
- **State Management**: JSON file for persistence
- **API Communication**: HTTP requests to AIR Server

---

## Implementation

### Registration
- Token-based registration with AIR Server
- JSON state file storage
- State persistence across restarts

### Health Monitoring
- Manual health updates
- Automatic mode with 45s intervals
- Basic retry logic

### Configuration
- Environment variables
- IP and OS auto-detection
- Docker networking support

---

## Configuration

### Environment Variables
```bash
AIR_SERVER_URL=http://localhost:3000/api
RESPONDER_IP=auto
RESPONDER_OS=auto
HEALTH_INTERVAL=45
LOG_LEVEL=info
```

---

## Usage

### Prerequisites
- Node.js 18+
- AIR Server running

### Commands
```bash
# Install dependencies
npm install

# Register with AIR Server
node src/cli.js register

# Start health monitoring
node src/cli.js health --auto

# Send single health update
node src/cli.js health

# Deregister
node src/cli.js deregister
```

### Docker
```bash
# Build
docker build -t responder-service .

# Run
docker run -e AIR_SERVER_URL=http://air-server:3000/api \
           responder-service node src/cli.js health --auto
```

---

## Error Handling

- Basic retry logic for API calls
- Graceful handling of missing state files
- Signal handling for clean shutdown

---

## Code Structure

- `src/cli.js` - Main CLI entry point
- `src/commands/` - Command implementations
- `src/services/` - Business logic
- `src/config/` - Configuration
- `src/utils/` - Utilities
