"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const types_1 = require("../types");
const CallQueue_1 = require("./CallQueue");
const constants_1 = require("../config/constants");
class Router {
    constructor(stateManager, eventBus, agentManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.agentManager = agentManager;
        this.queue = new CallQueue_1.CallQueue();
        this.eventBus.on(types_1.EventType.CALL_STATE_CHANGED, this.handleCallStateChange.bind(this));
        this.eventBus.on(types_1.EventType.AGENT_STATE_CHANGED, this.handleAgentStateChange.bind(this));
    }
    handleCallStateChange(event) {
        const { callId, newState } = event.payload;
        if (newState === types_1.CallState.RINGING) {
            this.routeCall(callId);
        }
    }
    handleAgentStateChange(event) {
        const { newState } = event.payload;
        if (newState === 'AVAILABLE') {
            this.processQueue();
        }
    }
    routeCall(callId) {
        const agent = this.agentManager.assignAgent(callId);
        if (agent) {
            this.connectCall(callId, agent.id);
        }
        else {
            this.queueCall(callId);
        }
    }
    connectCall(callId, agentId) {
        this.stateManager.updateCallState(callId, types_1.CallState.CONNECTED);
        this.eventBus.emit(types_1.EventType.CALL_STATE_CHANGED, {
            callId,
            newState: types_1.CallState.CONNECTED
        });
        const duration = this.randomCallDuration();
        setTimeout(() => {
            this.completeCall(callId, agentId);
        }, duration);
    }
    completeCall(callId, agentId) {
        const call = this.stateManager.getCall(callId);
        if (!call || call.state !== types_1.CallState.CONNECTED)
            return;
        this.stateManager.updateCallState(callId, types_1.CallState.COMPLETED);
        this.eventBus.emit(types_1.EventType.CALL_STATE_CHANGED, {
            callId,
            newState: types_1.CallState.COMPLETED
        });
        this.agentManager.releaseAgent(agentId);
    }
    queueCall(callId) {
        this.queue.enqueue(callId);
        this.stateManager.updateCallState(callId, types_1.CallState.QUEUED);
        this.eventBus.emit(types_1.EventType.CALL_QUEUED, { callId });
    }
    processQueue() {
        if (this.queue.isEmpty())
            return;
        const callId = this.queue.dequeue();
        if (!callId)
            return;
        const call = this.stateManager.getCall(callId);
        if (!call || call.state !== types_1.CallState.QUEUED) {
            this.processQueue();
            return;
        }
        this.eventBus.emit(types_1.EventType.CALL_DEQUEUED, { callId });
        this.routeCall(callId);
    }
    randomCallDuration() {
        return (constants_1.CONFIG.CALL_DURATION_MIN_MS +
            Math.random() * (constants_1.CONFIG.CALL_DURATION_MAX_MS - constants_1.CONFIG.CALL_DURATION_MIN_MS));
    }
    getQueueLength() {
        return this.queue.length();
    }
}
exports.Router = Router;
