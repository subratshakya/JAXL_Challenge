import { Event, EventType } from '../types';

type EventListener = (event: Event) => void;

export class EventBus {
  private listeners: Map<EventType, EventListener[]> = new Map();

  on(eventType: EventType, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  emit(eventType: EventType, payload: any): void {
    const event: Event = {
      type: eventType,
      payload,
      timestamp: Date.now()
    };

    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }
}