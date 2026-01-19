import { Agent, AgentState, EventType } from '../types';
import { StateManager } from './StateManager';
import { EventBus } from './EventBus';
import { CONFIG } from '../config/constants';

export class AgentManager {
  constructor(
    private stateManager: StateManager,
    private eventBus: EventBus
  ) {
    this.initializeAgents();
  }

  private initializeAgents(): void {
    for (let i = 1; i <= CONFIG.NUM_AGENTS; i++) {
      const agent: Agent = {
        id: `agent-${i}`,
        name: `Agent ${i}`,
        state: AgentState.AVAILABLE,
        callsHandled: 0
      };
      this.stateManager.addAgent(agent);
    }
  }

  assignAgent(callId: string): Agent | null {
    const availableAgents = this.stateManager.getAvailableAgents();
    if (availableAgents.length === 0) return null;

    const agent = availableAgents[0];
    this.stateManager.assignCallToAgent(callId, agent.id);
    this.stateManager.updateAgentState(agent.id, AgentState.BUSY);
    
    this.eventBus.emit(EventType.AGENT_STATE_CHANGED, {
      agentId: agent.id,
      newState: AgentState.BUSY
    });

    return agent;
  }

  releaseAgent(agentId: string): void {
    this.stateManager.releaseAgent(agentId);
    this.stateManager.updateAgentState(agentId, AgentState.AVAILABLE);
    
    this.eventBus.emit(EventType.AGENT_STATE_CHANGED, {
      agentId,
      newState: AgentState.AVAILABLE
    });
  }
}