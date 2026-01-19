"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallQueue = void 0;
class CallQueue {
    constructor() {
        this.queue = [];
    }
    enqueue(callId) {
        this.queue.push(callId);
    }
    dequeue() {
        return this.queue.shift();
    }
    length() {
        return this.queue.length;
    }
    isEmpty() {
        return this.queue.length === 0;
    }
}
exports.CallQueue = CallQueue;
