"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallEngine = void 0;
const uuid_1 = require("uuid");
const types_1 = require("../types");
const constants_1 = require("../config/constants");
class CallEngine {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }
    start() {
        if (this.intervalId)
            return;
        this.stateManager.setGenerating(true);
        this.intervalId = setInterval(() => {
            this.generateCall();
        }, constants_1.CONFIG.CALL_GENERATION_RATE_MS);
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            this.stateManager.setGenerating(false);
        }
    }
    generateCall() {
        const call = {
            id: (0, uuid_1.v4)(),
            state: types_1.CallState.DIALING,
            createdAt: Date.now()
        };
        this.stateManager.addCall(call);
        this.eventBus.emit(types_1.EventType.CALL_CREATED, { callId: call.id });
    }
}
exports.CallEngine = CallEngine;
