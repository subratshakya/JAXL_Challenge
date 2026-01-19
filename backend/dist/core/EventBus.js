"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    on(eventType, listener) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(listener);
    }
    emit(eventType, payload) {
        const event = {
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
exports.EventBus = EventBus;
