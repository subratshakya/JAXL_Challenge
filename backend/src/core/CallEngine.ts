import { v4 as uuidv4 } from 'uuid';
import { Call, CallState, EventType } from '../types';
import { StateManager } from './StateManager';
import { EventBus } from './EventBus';
import { CONFIG } from '../config/constants';

export class CallEngine {
  private intervalId?: NodeJS.Timeout;

  constructor(
    private stateManager: StateManager,
    private eventBus: EventBus
  ) {}

  start(): void {
    if (this.intervalId) return;

    this.stateManager.setGenerating(true);
    this.intervalId = setInterval(() => {
      this.generateCall();
    }, CONFIG.CALL_GENERATION_RATE_MS);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      this.stateManager.setGenerating(false);
    }
  }

  private generateCall(): void {
    const call: Call = {
      id: uuidv4(),
      state: CallState.DIALING,
      createdAt: Date.now()
    };

    this.stateManager.addCall(call);
    this.eventBus.emit(EventType.CALL_CREATED, { callId: call.id });
  }
}