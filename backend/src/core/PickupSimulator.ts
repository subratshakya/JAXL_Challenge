import { EventType, CallState } from '../types';
import { StateManager } from './StateManager';
import { EventBus } from './EventBus';
import { CONFIG } from '../config/constants';

export class PickupSimulator {
  constructor(
    private stateManager: StateManager,
    private eventBus: EventBus
  ) {
    this.eventBus.on(EventType.CALL_CREATED, this.handleCallCreated.bind(this));
  }

  private handleCallCreated(event: any): void {
    const { callId } = event.payload;
    const delay = this.randomDelay();

    setTimeout(() => {
      this.simulatePickup(callId);
    }, delay);
  }

  private simulatePickup(callId: string): void {
    const call = this.stateManager.getCall(callId);
    if (!call || call.state !== CallState.DIALING) return;

    const pickedUp = Math.random() < CONFIG.PICKUP_PROBABILITY;

    if (pickedUp) {
      this.stateManager.updateCallState(callId, CallState.RINGING);
      this.eventBus.emit(EventType.CALL_STATE_CHANGED, {
        callId,
        newState: CallState.RINGING
      });
    } else {
      this.stateManager.updateCallState(callId, CallState.DROPPED);
      this.eventBus.emit(EventType.CALL_STATE_CHANGED, {
        callId,
        newState: CallState.DROPPED
      });
    }
  }

  private randomDelay(): number {
    return (
      CONFIG.PICKUP_DELAY_MIN_MS +
      Math.random() * (CONFIG.PICKUP_DELAY_MAX_MS - CONFIG.PICKUP_DELAY_MIN_MS)
    );
  }
}