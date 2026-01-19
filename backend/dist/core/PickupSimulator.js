"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupSimulator = void 0;
const types_1 = require("../types");
const constants_1 = require("../config/constants");
class PickupSimulator {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.eventBus.on(types_1.EventType.CALL_CREATED, this.handleCallCreated.bind(this));
    }
    handleCallCreated(event) {
        const { callId } = event.payload;
        const delay = this.randomDelay();
        setTimeout(() => {
            this.simulatePickup(callId);
        }, delay);
    }
    simulatePickup(callId) {
        const call = this.stateManager.getCall(callId);
        if (!call || call.state !== types_1.CallState.DIALING)
            return;
        const pickedUp = Math.random() < constants_1.CONFIG.PICKUP_PROBABILITY;
        if (pickedUp) {
            this.stateManager.updateCallState(callId, types_1.CallState.RINGING);
            this.eventBus.emit(types_1.EventType.CALL_STATE_CHANGED, {
                callId,
                newState: types_1.CallState.RINGING
            });
        }
        else {
            this.stateManager.updateCallState(callId, types_1.CallState.DROPPED);
            this.eventBus.emit(types_1.EventType.CALL_STATE_CHANGED, {
                callId,
                newState: types_1.CallState.DROPPED
            });
        }
    }
    randomDelay() {
        return (constants_1.CONFIG.PICKUP_DELAY_MIN_MS +
            Math.random() * (constants_1.CONFIG.PICKUP_DELAY_MAX_MS - constants_1.CONFIG.PICKUP_DELAY_MIN_MS));
    }
}
exports.PickupSimulator = PickupSimulator;
