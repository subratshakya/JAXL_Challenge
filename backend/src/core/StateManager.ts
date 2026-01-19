import { Agent, Call, SystemState, AgentState, CallState } from '../types';

export class StateManager {
  private agents: Map<string, Agent> = new Map();
  private calls: Map<string, Call> = new Map();
  private generating: boolean = true;

  addAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  updateAgentState(id: string, state: AgentState): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.state = state;
    }
  }

  assignCallToAgent(callId: string, agentId: string): void {
    const agent = this.agents.get(agentId);
    const call = this.calls.get(callId);
    
    if (agent && call) {
      agent.currentCallId = callId;
      call.agentId = agentId;
    }
  }

  releaseAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.currentCallId = undefined;
      agent.callsHandled++;
    }
  }

  addCall(call: Call): void {
    this.calls.set(call.id, call);
  }

  getCall(id: string): Call | undefined {
    return this.calls.get(id);
  }

  updateCallState(id: string, state: CallState): void {
    const call = this.calls.get(id);
    if (call) {
      call.state = state;
      
      if (state === CallState.QUEUED) {
        call.queuedAt = Date.now();
      } else if (state === CallState.CONNECTED) {
        call.connectedAt = Date.now();
      } else if (state === CallState.COMPLETED || state === CallState.DROPPED) {
        call.completedAt = Date.now();
      }
    }
  }

  getAvailableAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.state === AgentState.AVAILABLE
    );
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAllCalls(): Call[] {
    return Array.from(this.calls.values());
  }

  getActiveCalls(): Call[] {
    return Array.from(this.calls.values()).filter(
      call => call.state !== CallState.COMPLETED && call.state !== CallState.DROPPED
    );
  }

  setGenerating(generating: boolean): void {
    this.generating = generating;
  }

  isGenerating(): boolean {
    return this.generating;
  }

  getState(): SystemState {
    return {
      agents: this.getAllAgents(),
      calls: this.getActiveCalls(),
      queueLength: 0,
      generating: this.generating
    };
  }
}