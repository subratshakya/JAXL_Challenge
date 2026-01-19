import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { StateManager } from './core/StateManager';
import { EventBus } from './core/EventBus';
import { CallEngine } from './core/CallEngine';
import { PickupSimulator } from './core/PickupSimulator';
import { AgentManager } from './core/AgentManager';
import { Router } from './core/Router';
import { MetricsCollector } from './core/MetricsCollector';
import { CONFIG } from './config/constants';
import { EventType } from './types';

export class CallRoutingServer {
  private app = express();
  private wss: WebSocketServer;
  private stateManager: StateManager;
  private eventBus: EventBus;
  private callEngine: CallEngine;
  private pickupSimulator: PickupSimulator;
  private agentManager: AgentManager;
  private router: Router;
  private metricsCollector: MetricsCollector;
  private clients: Set<WebSocket> = new Set();

  constructor() {
    this.stateManager = new StateManager();
    this.eventBus = new EventBus();
    this.metricsCollector = new MetricsCollector(this.stateManager);
    this.agentManager = new AgentManager(this.stateManager, this.eventBus);
    this.router = new Router(this.stateManager, this.eventBus, this.agentManager);
    this.pickupSimulator = new PickupSimulator(this.stateManager, this.eventBus);
    this.callEngine = new CallEngine(this.stateManager, this.eventBus);

    this.wss = new WebSocketServer({ port: CONFIG.WEB_SOCKET_PORT });
    this.setupWebSocket();
    this.setupEventListeners();
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      this.sendStateUpdate(ws);

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });
  }

  private setupEventListeners(): void {
    const stateChangeEvents = [
      EventType.CALL_CREATED,
      EventType.CALL_STATE_CHANGED,
      EventType.AGENT_STATE_CHANGED,
      EventType.CALL_QUEUED,
      EventType.CALL_DEQUEUED
    ];

    stateChangeEvents.forEach(eventType => {
      this.eventBus.on(eventType, () => {
        this.broadcastState();
      });
    });
  }

  private broadcastState(): void {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        this.sendStateUpdate(client);
      }
    });
  }

  private sendStateUpdate(client: WebSocket): void {
    const state = this.stateManager.getState();
    state.queueLength = this.router.getQueueLength();
    state.metrics = this.metricsCollector.collectMetrics();

    client.send(JSON.stringify({
      type: 'STATE_UPDATE',
      payload: state
    }));
  }

  start(): void {
    this.callEngine.start();
    console.log(`WebSocket server running on port ${CONFIG.WEB_SOCKET_PORT}`);
  }
}