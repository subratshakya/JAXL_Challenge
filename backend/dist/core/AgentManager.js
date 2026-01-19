"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManager = void 0;
const types_1 = require("../types");
const constants_1 = require("../config/constants");
class AgentManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.initializeAgents();
    }
    initializeAgents() {
        for (let i = 1; i <= constants_1.CONFIG.NUM_AGENTS; i++) {
            const agent = {
                id: `agent-${i}`,
                name: `Agent ${i}`,
                state: types_1.AgentState.AVAILABLE,
                callsHandled: 0
            };
            this.stateManager.addAgent(agent);
        }
    }
    assignAgent(callId) {
        const availableAgents = this.stateManager.getAvailableAgents();
        if (availableAgents.length === 0)
            return null;
        const agent = availableAgents[0];
        this.stateManager.assignCallToAgent(callId, agent.id);
        this.stateManager.updateAgentState(agent.id, types_1.AgentState.BUSY);
        this.eventBus.emit(types_1.EventType.AGENT_STATE_CHANGED, {
            agentId: agent.id,
            newState: types_1.AgentState.BUSY
        });
        return agent;
    }
    releaseAgent(agentId) {
        this.stateManager.releaseAgent(agentId);
        this.stateManager.updateAgentState(agentId, types_1.AgentState.AVAILABLE);
        this.eventBus.emit(types_1.EventType.AGENT_STATE_CHANGED, {
            agentId,
            newState: types_1.AgentState.AVAILABLE
        });
    }
}
exports.AgentManager = AgentManager;
