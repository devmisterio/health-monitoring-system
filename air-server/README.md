# AIR Server - Responder Health Monitoring System

## 🎯 Project Overview

This AIR Server implementation is a Node.js application designed to monitor endpoint responders' health status efficiently. Built with, demonstrates batch processing optimization and clean architecture patterns.

### 🏗️ Problem Statement & Solution

**Challenge**: Monitor thousands of responders in near real-time without overwhelming the server infrastructure.

**Solution**: Implemented a **batch processing queue system** that optimizes database operations while maintaining health status accuracy.

---

## 🚀 Key Features

### 1. Queue-Based Health Processing
- **Dual-threshold batching**: Processes updates when reaching 50 responders OR 5-second time limit
- **Redis buffering**: Deduplicates health updates per responder
- **Atomic operations**: Race-condition-free batch processing
- **Graceful shutdown**: Processes remaining batches before termination

### 2. Performance Optimizations
- **Bulk database operations**: Single transaction for batch updates
- **Strategic indexing**: Efficient queries on responder data
- **Connection pooling**: PostgreSQL and Redis connection management
- **Memory-efficient processing**: In-memory responder lookups

---

## 🛠️ Technology Stack & Architecture Decisions

### Core Technologies
- **NestJS + TypeScript**: Enterprise framework with dependency injection and decorators
- **PostgreSQL**: ACID-compliant database with native IP address types
- **Redis + BullMQ**: High-performance queue system with job management
- **TypeORM**: Type-safe ORM with migration support

### Architecture Patterns
- **Modular Monolith**: Clear module boundaries with single deployment
- **Event-Driven Processing**: Queue-based async health update handling
- **Domain-Driven Design**: Focused business logic around "responders" domain
- **TypeORM Integration**: Direct repository usage with type safety

---

## 📊 System Capabilities

### Batch Processing Benefits
- **Reduced Database Load**: Bulk operations instead of individual writes
- **Configurable Parameters**: Adjust batch size and timing thresholds
- **Efficient Memory Usage**: In-memory responder lookups and deduplication
- **Queue Processing**: Automated batch processing with monitoring capabilities

---

## 🏛️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Responders    │────│   AIR Server     │────│   Dashboard     │
│   (Thousands)   │    │                  │    │      UI         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              ┌──────────┐ ┌─────┐ ┌──────────┐
              │PostgreSQL│ │Redis│ │ Queue    │
              │Database  │ │Cache│ │Processor │
              └──────────┘ └─────┘ └──────────┘
```

### Data Flow Architecture
1. **Registration**: Responders register with authentication tokens
2. **Health Updates**: Batched processing through Redis queue system
3. **Status Monitoring**: Real-time health status computation with configurable thresholds
4. **API Access**: RESTful endpoints for responder management and monitoring

---

## 🔧 Core Features & Capabilities

### Responder Management
- ✅ **Registration/Deregistration**: Token-based authentication with tenant isolation
- ✅ **Health Monitoring**: Fixed timeout threshold (60 seconds)
- ✅ **Metadata Tracking**: IP address, operating system, last seen timestamps
- ✅ **Pagination Support**: Efficient handling of large responder datasets

### Health Status Optimization
- ✅ **Batch Processing**: Intelligent batching with dual triggers (count + time)
- ✅ **Redis Buffering**: High-performance temporary storage for health updates
- ✅ **Atomic Operations**: Race-condition-free batch processing
- ✅ **Deduplication**: Ensures only latest update per responder is processed

### API Endpoints
```
POST   /api/register           # Register new responder
DELETE /api/deregister         # Deregister responder  
POST   /api/health             # Submit health update (batched)
GET    /api/responders         # List responders (paginated)
GET    /api/responders/:id     # Get specific responder
GET    /api/admin/stats        # System statistics
```

---

## ⚙️ Configuration & Environment

### Environment Variables
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=air_server

# Redis Configuration  
REDIS_HOST=localhost
REDIS_PORT=6379

# Performance Tuning
BATCH_THRESHOLD=50              # Max responders per batch
BATCH_TIME_THRESHOLD=5000       # Max batch delay (ms)

# Rate Limiting
THROTTLER_TTL=60000             # Rate limit window (ms)
THROTTLER_LIMIT=60              # Max requests per window

# Application
PORT=3000
NODE_ENV=production
```

### Performance Tuning Parameters
- **BATCH_THRESHOLD**: Balance between database efficiency and update latency
- **BATCH_TIME_THRESHOLD**: Maximum delay before processing partial batches

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested with Node.js 23)
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose (optional)

### Installation
```bash
# Install dependencies
npm install

# Ensure .env file exists with required variables
# (Check the .env file for database and Redis configuration)

# Start development server (requires PostgreSQL and Redis running)
npm run start:dev
```

### Docker Deployment
```bash
# Build Docker image
docker build -t air-server .

# Run container (requires external PostgreSQL and Redis)
docker run -p 3000:3000 air-server
```

---

## 🧪 Testing & Quality Assurance

### Testing Strategy
```bash
# Unit tests (for src/responders/entities/responder.entity.spec.ts file)
npm run test
```

### Code Quality
- **TypeScript Strict Mode**: Full type safety enforcement
- **ESLint Configuration**: Consistent code style and best practices
- **Unit Tests**: Core business logic validation

---

## 📈 Logging & Error Handling

- **Basic Logging**: Console-based logging for development
- **Error Handling**: Categorized error handling with retry logic
- **Queue Processing**: Automatic batch processing with failure recovery

---

## 🔮 Architecture Decisions & Trade-offs

### Why Batch Processing?
- **Problem**: Direct database writes for thousands of health updates cause performance bottlenecks
- **Solution**: Intelligent batching reduces database load while maintaining acceptable latency
- **Trade-off**: Slight delay (configurable 2-5 seconds) vs. massive performance improvement

### Why Redis for Buffering?
- **Performance**: In-memory operations are 100x faster than database writes
- **Atomicity**: HSET operations provide natural deduplication
- **Scalability**: Horizontal scaling through Redis clustering

---

## 📚 Additional Information

For more details about the implementation, check the source code structure:
- `src/responders/` - Core responder management logic
- `src/responders/queue/` - Batch processing implementation
- `src/config/` - Configuration management
- `Dockerfile` - Container deployment configuration

---

## 👨‍💻 About This Implementation

This AIR Server implementation demonstrates:

- **Queue-Based Architecture**: Solving scalability challenges through intelligent batching
- **Performance Optimization**: Reducing database load through efficient batch processing
- **Clean Code Practices**: Type-safe, well-structured, and maintainable codebase
- **Modern Patterns**: Dependency injection, domain-driven design, and configuration management

The implementation showcases practical solutions for monitoring thousands of endpoints efficiently while maintaining clean architecture principles.
