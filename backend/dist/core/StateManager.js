"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = void 0;
const types_1 = require("../types");
class StateManager {
    constructor() {
        this.agents = new Map();
        this.calls = new Map();
        this.generating = true;
    }
    addAgent(agent) {
        this.agents.set(agent.id, agent);
    }
    getAgent(id) {
        return this.agents.get(id);
    }
    updateAgentState(id, state) {
        const agent = this.agents.get(id);
        if (agent) {
            agent.state = state;
        }
    }
    assignCallToAgent(callId, agentId) {
        const agent = this.agents.get(agentId);
        const call = this.calls.get(callId);
        if (agent && call) {
            agent.currentCallId = callId;
            call.agentId = agentId;
        }
    }
    releaseAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.currentCallId = undefined;
            agent.callsHandled++;
        }
    }
    addCall(call) {
        this.calls.set(call.id, call);
    }
    getCall(id) {
        return this.calls.get(id);
    }
    updateCallState(id, state) {
        const call = this.calls.get(id);
        if (call) {
            call.state = state;
            if (state === types_1.CallState.QUEUED) {
                call.queuedAt = Date.now();
            }
            else if (state === types_1.CallState.CONNECTED) {
                call.connectedAt = Date.now();
            }
            else if (state === types_1.CallState.COMPLETED || state === types_1.CallState.DROPPED) {
                call.completedAt = Date.now();
            }
        }
    }
    getAvailableAgents() {
        return Array.from(this.agents.values()).filter(agent => agent.state === types_1.AgentState.AVAILABLE);
    }
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    getAllCalls() {
        return Array.from(this.calls.values());
    }
    getActiveCalls() {
        return Array.from(this.calls.values()).filter(call => call.state !== types_1.CallState.COMPLETED && call.state !== types_1.CallState.DROPPED);
    }
    setGenerating(generating) {
        this.generating = generating;
    }
    isGenerating() {
        return this.generating;
    }
    getState() {
        return {
            agents: this.getAllAgents(),
            calls: this.getActiveCalls(),
            queueLength: 0,
            generating: this.generating
        };
    }
}
exports.StateManager = StateManager;
