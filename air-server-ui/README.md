# AIR Server UI

## Overview

A Vue 3 frontend dashboard for monitoring responder endpoints in the AIR Server system.

---

## Features

### Dashboard Interface
- List of registered responders with pagination
- Real-time health status monitoring
- System statistics display
- Responsive design for mobile and desktop

### Data Display
- Responder details (ID, IP, OS, status)
- Last seen timestamps with relative time
- Health status with color-coded indicators
- Total counts and statistics

---

## Technology Stack

- **Vue 3**: Frontend framework with Composition API
- **Vite**: Build tool and dev server
- **Axios**: HTTP client for API communication
- **Nginx**: Production web server (Docker)

---

## API Integration

### Backend Endpoints
```javascript
GET /api/responders      // Paginated responder list
GET /api/admin/stats     // System statistics
```

### Polling Strategy
- Auto-refresh every 45 seconds
- Manual refresh capability
- Rate limiting awareness (429 error handling)

---

## Component Architecture

- **App.vue**: Main container with state management
- **DashboardHeader.vue**: Statistics display component
- **ResponderCard.vue**: Individual responder display

### Data Flow
1. Component mounts and fetches initial data
2. Polling interval updates data every 45s

---

## Development

### Prerequisites
- Node.js 18+
- AIR Server running on port 3000

### Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

```

### Environment Variables
```bash
VITE_API_BASE=http://localhost:3000
```

---

## Docker Deployment

```bash
# Build image
docker build -t air-server-ui .

# Run container
docker run -p 8080:80 air-server-ui
```

---

## Features Implementation

### Pagination
- Server-side pagination (50 items per page)
- Navigation controls with disable states
- Page info display

### Error Handling
- Network error notifications
- Rate limiting detection
- Graceful fallbacks for missing data

### Performance
- Efficient polling with interval management
- Conditional rendering for loading states
- Responsive grid layout

---

## Project Structure

```
src/
├── App.vue              # Main application component
├── components/
│   ├── DashboardHeader.vue   # Statistics header
│   └── ResponderCard.vue     # Individual responder display
└── main.js             # Application entry point
```
