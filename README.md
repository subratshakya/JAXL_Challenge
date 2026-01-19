# 📞 Call Routing System

A real-time call distribution and agent management system built with **TypeScript**, **Node.js**, and **React**.

---

## 📖 Overview

This system simulates a realistic call center environment by automatically generating incoming calls, routing them to available agents, managing FIFO queues, and broadcasting real-time state updates to a live dashboard via WebSockets.

---

## 🏗 Architecture

The system is composed of two primary components:

### Backend (TypeScript / Node.js)

| Component | Description |
|---------|-------------|
| **CallRoutingServer** | Orchestrates all system components |
| **CallEngine** | Generates calls at configurable intervals |
| **StateManager** | Maintains global state for calls and agents |
| **Router** | Routes calls to agents or queues |
| **AgentManager** | Manages agent availability and assignments |
| **PickupSimulator** | Simulates call pickup behavior |
| **MetricsCollector** | Collects and computes system metrics |
| **EventBus** | Event-driven communication layer |

---

### Frontend (React)

- WebSocket-based real-time dashboard
- Displays:
  - Agent statuses
  - Call states
  - Queue length
  - System metrics

---

## ✨ Features

- **Real-time Call Generation**  
  Automatically generates calls every 2 seconds

- **Agent Management**  
  Manages 5 agents with `AVAILABLE` and `BUSY` states

- **Call Lifecycle Tracking**  
  `DIALING → RINGING → CONNECTED → COMPLETED / DROPPED`

- **FIFO Queue Management**  
  Queues calls when no agents are available

- **Live Dashboard**  
  Real-time UI updates via WebSockets

- **Metrics Collection**
  - Total calls
  - Completed calls
  - Dropped calls
  - Average wait time
  - Agent utilization

---

## 🔄 How It Works

1. **Call Generation**  
   `CallEngine` generates new calls at fixed intervals

2. **Pickup Simulation**  
   `PickupSimulator` determines pickup using configurable probability

3. **Routing**  
   `Router` assigns calls to free agents or enqueues them

4. **State Management**  
   `StateManager` tracks call and agent states

5. **Real-time Updates**  
   WebSocket connections broadcast state changes to the frontend

---

## ⚙️ Configuration

All system parameters can be modified in:

backend/src/config/constants.ts

yaml
Copy code

```ts
CALL_GENERATION_RATE_MS: 2000
PICKUP_DELAY_MIN_MS: 2000
PICKUP_DELAY_MAX_MS: 6000
PICKUP_PROBABILITY: 0.8
CALL_DURATION_MIN_MS: 5000
CALL_DURATION_MAX_MS: 15000
NUM_AGENTS: 5
WEB_SOCKET_PORT: 3001
🧪 Testing
Framework
Jest

ts-jest for TypeScript support

Test Coverage
The test suite covers core system components:

CallQueue

FIFO behavior

Enqueue / dequeue

Empty state handling

StateManager

Agent and call lifecycle

State transitions

Agent availability logic

EventBus

Event emission

Multiple listeners

Event isolation

Running Tests
bash
Copy code
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
🚀 Setup & Installation
Prerequisites
Node.js (>= 18)

npm or yarn

Backend Setup
bash
Copy code
cd backend
npm install
npm start
Backend runs on WebSocket port 3001.

Frontend Setup
bash
Copy code
cd frontend
npm install
npm start
Frontend runs at:

arduino
Copy code
http://localhost:5173
📁 File Structure
pgsql
Copy code
├── backend/
│   ├── src/
│   │   ├── core/
│   │   │   ├── AgentManager.ts
│   │   │   ├── CallEngine.ts
│   │   │   ├── CallQueue.ts
│   │   │   ├── EventBus.ts
│   │   │   ├── MetricsCollector.ts
│   │   │   ├── PickupSimulator.ts
│   │   │   ├── Router.ts
│   │   │   ├── StateManager.ts
│   │   │   └── __tests__/
│   │   │       └── basic.test.ts
│   │   ├── config/
│   │   │   └── constants.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── server.ts
│   ├── jest.config.js
│
├── frontend/
│   ├── src/
│   │   └── App.jsx
│   └── index.html
📝 Notes
Event-driven architecture using a centralized EventBus

WebSockets used for real-time state propagation

Designed for scalability and easy experimentation
