import { EventType, CallState } from '../types';
import { StateManager } from './StateManager';
import { EventBus } from './EventBus';
import { AgentManager } from './AgentManager';
import { CallQueue } from './CallQueue';
import { CONFIG } from '../config/constants';

export class Router {
  private queue: CallQueue = new CallQueue();

  constructor(
    private stateManager: StateManager,
    private eventBus: EventBus,
    private agentManager: AgentManager
  ) {
    this.eventBus.on(EventType.CALL_STATE_CHANGED, this.handleCallStateChange.bind(this));
    this.eventBus.on(EventType.AGENT_STATE_CHANGED, this.handleAgentStateChange.bind(this));
  }

  private handleCallStateChange(event: any): void {
    const { callId, newState } = event.payload;

    if (newState === CallState.RINGING) {
      this.routeCall(callId);
    }
  }

  private handleAgentStateChange(event: any): void {
    const { newState } = event.payload;

    if (newState === 'AVAILABLE') {
      this.processQueue();
    }
  }

  private routeCall(callId: string): void {
    const agent = this.agentManager.assignAgent(callId);

    if (agent) {
      this.connectCall(callId, agent.id);
    } else {
      this.queueCall(callId);
    }
  }

  private connectCall(callId: string, agentId: string): void {
    this.stateManager.updateCallState(callId, CallState.CONNECTED);
    this.eventBus.emit(EventType.CALL_STATE_CHANGED, {
      callId,
      newState: CallState.CONNECTED
    });

    const duration = this.randomCallDuration();
    setTimeout(() => {
      this.completeCall(callId, agentId);
    }, duration);
  }

  private completeCall(callId: string, agentId: string): void {
    const call = this.stateManager.getCall(callId);
    if (!call || call.state !== CallState.CONNECTED) return;

    this.stateManager.updateCallState(callId, CallState.COMPLETED);
    this.eventBus.emit(EventType.CALL_STATE_CHANGED, {
      callId,
      newState: CallState.COMPLETED
    });

    this.agentManager.releaseAgent(agentId);
  }

  private queueCall(callId: string): void {
    this.queue.enqueue(callId);
    this.stateManager.updateCallState(callId, CallState.QUEUED);
    this.eventBus.emit(EventType.CALL_QUEUED, { callId });
  }

  private processQueue(): void {
    if (this.queue.isEmpty()) return;

    const callId = this.queue.dequeue();
    if (!callId) return;

    const call = this.stateManager.getCall(callId);
    if (!call || call.state !== CallState.QUEUED) {
      this.processQueue();
      return;
    }

    this.eventBus.emit(EventType.CALL_DEQUEUED, { callId });
    this.routeCall(callId);
  }

  private randomCallDuration(): number {
    return (
      CONFIG.CALL_DURATION_MIN_MS +
      Math.random() * (CONFIG.CALL_DURATION_MAX_MS - CONFIG.CALL_DURATION_MIN_MS)
    );
  }

  getQueueLength(): number {
    return this.queue.length();
  }
}