# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

React 19 frontend for a real-time chat application using WebSocket communication (STOMP over SockJS). Connects to a Spring Boot backend at `localhost:8080`.

## Commands

```bash
# Development
npm start          # Start dev server at http://localhost:3000

# Build
npm run build      # Production build to build/

# Testing
npm test                      # Run tests in watch mode
npm test -- --watchAll=false  # Run tests once (CI mode)
npm test -- <filename>        # Run specific test file
```

## Architecture

### State Management
Uses React Context API with two main contexts:
- `AuthContext` (`src/contexts/AuthContext.js`) - Handles authentication state, login/logout, and user data
- `ChatContext` (`src/contexts/ChatContext.js`) - Manages messages, active users, rooms, and WebSocket connection state

### Services Layer (`src/services/`)
- `api.js` - Axios instance with JWT interceptors and automatic token refresh on 401
- `authService.js` - Auth operations (login, register, logout) and token management via localStorage
- `chatService.js` - REST API calls for rooms, messages, and user operations
- `websocketService.js` - STOMP/SockJS WebSocket client singleton for real-time messaging

### WebSocket Topics
- `/topic/public` - Public chat messages
- `/user/queue/private` - Private messages
- `/topic/activeUsers` - Online user updates

### Configuration
`src/config.js` defines API endpoints and localStorage keys:
- `API_BASE_URL`: REST API base URL
- `WS_BASE_URL`: WebSocket endpoint
- `TOKEN_KEY`, `REFRESH_TOKEN_KEY`, `USER_KEY`: localStorage keys

### Component Structure
- `components/auth/` - Login and Register forms
- `components/chat/` - Chat UI (ChatRoom, MessageList, MessageInput, UserList, ChatHeader)
- `components/common/` - Shared components (PrivateRoute for auth guards)

### Routes
- `/login` - Login page
- `/register` - Registration page
- `/chat` - Main chat room (protected route)
- `/` - Redirects to `/chat`

## Key Patterns

- All API responses follow `{ success: boolean, data?: any, message?: string }` structure
- WebSocket messages use `type` field: `CHAT`, `JOIN`, `LEAVE`, `TYPING`, `ACTIVE_USERS`
- Components use custom hooks (`useAuth`, `useChat`) to access context
- Token stored in localStorage is automatically attached to requests via axios interceptor
