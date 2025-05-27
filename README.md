# AIR Server - Responder Health Monitoring System

A Node.js-based AIR Server implementation with batch processing optimization for monitoring endpoint responders.

## Project Overview

This project implements an AIR Server that monitors endpoint responders using batch processing to reduce database load. The system uses Redis queuing and dual-threshold batching to handle health updates efficiently.

### Problem Statement
AIR Servers managing tens of thousands of responders face significant scalability challenges when monitoring health status in real-time, leading to resource-intensive scale-out requirements.

### Solution
Uses batch processing with Redis buffering and dual triggers (50 responders OR 5 seconds) to reduce database operations while maintaining health update accuracy.

---

##  System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Responders    │────│   AIR Server     │────│   Dashboard     │
│   (CLI-based)   │    │   (NestJS API)   │    │   (Vue.js UI)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────┼────────┐              │
         │              ▼        ▼        ▼              │
         │        ┌──────────┐ ┌─────┐ ┌──────────┐      │
         │        │PostgreSQL│ │Redis│ │ Queue    │      │
         └────────│Database  │ │Cache│ │Processor │──────┘
                  └──────────┘ └─────┘ └──────────┘
```

### Components

1. **AIR Server** (NestJS + TypeScript)
   - RESTful API for responder management
   - Batch processing queue system with Redis
   - PostgreSQL database with optimized queries
   - Real-time health status monitoring

2. **Responder Service** (Node.js CLI)
   - Command-line interface for responder management
   - Automatic health reporting with configurable intervals
   - Token-based registration and state persistence
   - Connection pooling with keep-alive for efficient HTTP requests

3. **Dashboard UI** (Vue.js 3)
   - Real-time monitoring interface
   - Paginated responder listings
   - System statistics and health indicators

---

## Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended)
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if running locally)
- Redis 7+ (if running locally)

### Option 1: Docker Compose (Recommended)

```bash
# Clone and navigate to project
cd binalyze-app

# Start all services with 15 responders
docker-compose up --build

# Access the dashboard
open http://localhost:8080
```

**Services will be available at:**
- Dashboard UI: http://localhost:8080
- AIR Server API: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Option 2: Local Development

```bash
# 1. Start databases
docker-compose up postgres redis

# 2. Start AIR Server
cd air-server
npm install
npm run start:dev

# 3. Start Dashboard UI
cd ../air-server-ui
npm install
npm run dev

# 4. Register and run responders
cd ../responder-service
npm install
node src/cli.js register
node src/cli.js health --auto
```

---

## Usage Guide

### Managing Responders

```bash
cd responder-service

# Register a new responder
node src/cli.js register

# Send manual health update
node src/cli.js health

# Start automatic health monitoring (45s intervals)
node src/cli.js health --auto

# Deregister responder
node src/cli.js deregister
```

### Monitoring Dashboard

1. **Open Dashboard**: Navigate to http://localhost:8080
2. **View Responders**: See all registered endpoints with health status
3. **System Stats**: Monitor total responders and health percentages
4. **Real-time Updates**: Dashboard refreshes every 45 seconds automatically

### API Endpoints

```bash
# List responders (paginated)
GET http://localhost:3000/api/responders?page=1&limit=50

# Get system statistics
GET http://localhost:3000/api/admin/stats

# Register responder (used by CLI)
POST http://localhost:3000/api/register

# Submit health update (used by CLI)
POST http://localhost:3000/api/health
```

---

## Configuration

### Environment Variables

Create `.env` files or modify `docker-compose.yml` environment sections:

#### AIR Server
```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=air_user
DB_PASSWORD=air_password
DB_DATABASE=air_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Performance Tuning
BATCH_THRESHOLD=50              # Responders per batch
BATCH_TIME_THRESHOLD=5000       # Max batch delay (ms)

# Rate Limiting
THROTTLER_TTL=60000             # Rate limit window
THROTTLER_LIMIT=60              # Max requests per window
```

#### Responder Service
```bash
AIR_SERVER_URL=http://air-server:3000/api
HEALTH_INTERVAL=45              # Health update interval (seconds)
LOG_LEVEL=info
```

#### Dashboard UI
```bash
VITE_API_BASE=http://localhost:3000
```

---

## Key Features

### 1. Optimized Health Monitoring
- **Batch Processing**: Groups health updates to reduce database load
- **Dual Triggers**: Processes batches at 50 responders OR 5-second intervals
- **Redis Buffering**: High-performance temporary storage with deduplication
- **Atomic Operations**: Race-condition-free batch processing

### 2. System Architecture
- **Containerized Services**: Three Docker containers for API, UI, and CLI
- **Queue Processing**: Redis-based batching for health updates
- **Database**: PostgreSQL with TypeORM
- **Multiple Responders**: Docker Compose scales to 15 instances

### 3. Real-Time Dashboard
- **Live Updates**: 45-second refresh intervals with manual refresh option
- **Pagination**: Efficient handling of large responder datasets
- **Health Indicators**: Color-coded status with last-seen timestamps
- **System Statistics**: Overview of total responders and health percentages

### 4. Container Setup
- **Docker Support**: Dockerfile for each service
- **Health Checks**: PostgreSQL and Redis readiness checks
- **Error Handling**: Basic retry logic for API calls
- **Logging**: Console logging with configurable levels

---

## Testing & Quality

### Running Tests

```bash
# AIR Server unit tests
cd air-server
npm test
```

---

##  Performance Metrics

### Batch Processing Implementation
- **Database Operations**: Groups individual updates into batches
- **Redis Buffering**: Temporary storage with deduplication
- **Update Delay**: 2-5 second delay for batch processing
- **Test Scale**: Configured for 15 responder instances

### Current Implementation
- **Health Updates**: 45-second intervals from responders
- **UI Refresh**: Dashboard polls every 45 seconds
- **Pagination**: 50 responders per page
- **Database**: Bulk update operations for batched health data

---

## Architecture Decisions

### Why Batch Processing?
**Problem**: Individual database writes for each health update create performance bottlenecks.
**Solution**: Batch multiple updates into single database transactions.
**Trade-off**: 2-5 second delay vs reduced database load.

### Why Redis for Buffering?
**Performance**: In-memory operations reduce database calls.
**Deduplication**: HSET operations ensure latest update per responder.
**Queue Management**: BullMQ handles batch processing jobs.

### Why Connection Pooling in Responders?
**Efficiency**: Reuses TCP connections instead of creating new ones for each request.
**Configuration**: Max 5 concurrent connections, keeps 2 idle connections open.
**Keep-Alive**: Maintains persistent connections to reduce overhead.


---

## Project Structure

```
binalyze-app/
├── air-server/                 # NestJS API server
│   ├── src/
│   │   ├── responders/        # Core responder management
│   │   ├── queue/            # Batch processing logic
│   │   └── config/           # Configuration management
│   └── Dockerfile
├── responder-service/          # Node.js CLI application
│   ├── src/
│   │   ├── commands/         # CLI command implementations
│   │   ├── services/         # Business logic
│   │   └── config/           # Configuration
│   └── Dockerfile
├── air-server-ui/             # Vue.js dashboard
│   ├── src/
│   │   ├── components/       # Vue components
│   │   └── App.vue          # Main application
│   └── Dockerfile
├── docker-compose.yml         # Multi-service orchestration
```
