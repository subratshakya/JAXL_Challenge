"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallRoutingServer = void 0;
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const StateManager_1 = require("./core/StateManager");
const EventBus_1 = require("./core/EventBus");
const CallEngine_1 = require("./core/CallEngine");
const PickupSimulator_1 = require("./core/PickupSimulator");
const AgentManager_1 = require("./core/AgentManager");
const Router_1 = require("./core/Router");
const MetricsCollector_1 = require("./core/MetricsCollector");
const constants_1 = require("./config/constants");
const types_1 = require("./types");
class CallRoutingServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.clients = new Set();
        this.stateManager = new StateManager_1.StateManager();
        this.eventBus = new EventBus_1.EventBus();
        this.metricsCollector = new MetricsCollector_1.MetricsCollector(this.stateManager);
        this.agentManager = new AgentManager_1.AgentManager(this.stateManager, this.eventBus);
        this.router = new Router_1.Router(this.stateManager, this.eventBus, this.agentManager);
        this.pickupSimulator = new PickupSimulator_1.PickupSimulator(this.stateManager, this.eventBus);
        this.callEngine = new CallEngine_1.CallEngine(this.stateManager, this.eventBus);
        this.wss = new ws_1.WebSocketServer({ port: constants_1.CONFIG.WEB_SOCKET_PORT });
        this.setupWebSocket();
        this.setupEventListeners();
    }
    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            this.clients.add(ws);
            this.sendStateUpdate(ws);
            ws.on('close', () => {
                this.clients.delete(ws);
            });
        });
    }
    setupEventListeners() {
        const stateChangeEvents = [
            types_1.EventType.CALL_CREATED,
            types_1.EventType.CALL_STATE_CHANGED,
            types_1.EventType.AGENT_STATE_CHANGED,
            types_1.EventType.CALL_QUEUED,
            types_1.EventType.CALL_DEQUEUED
        ];
        stateChangeEvents.forEach(eventType => {
            this.eventBus.on(eventType, () => {
                this.broadcastState();
            });
        });
    }
    broadcastState() {
        this.clients.forEach(client => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                this.sendStateUpdate(client);
            }
        });
    }
    sendStateUpdate(client) {
        const state = this.stateManager.getState();
        state.queueLength = this.router.getQueueLength();
        state.metrics = this.metricsCollector.collectMetrics();
        client.send(JSON.stringify({
            type: 'STATE_UPDATE',
            payload: state
        }));
    }
    start() {
        this.callEngine.start();
        console.log(`WebSocket server running on port ${constants_1.CONFIG.WEB_SOCKET_PORT}`);
    }
}
exports.CallRoutingServer = CallRoutingServer;
