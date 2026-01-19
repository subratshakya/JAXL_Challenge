"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
const types_1 = require("../types");
class MetricsCollector {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }
    collectMetrics() {
        const allCalls = this.stateManager.getAllCalls();
        const agents = this.stateManager.getAllAgents();
        const completedCalls = allCalls.filter(c => c.state === types_1.CallState.COMPLETED);
        const droppedCalls = allCalls.filter(c => c.state === types_1.CallState.DROPPED);
        const waitTimes = completedCalls
            .filter(c => c.queuedAt && c.connectedAt)
            .map(c => (c.connectedAt - c.queuedAt) / 1000);
        const avgWaitTime = waitTimes.length > 0
            ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length * 10) / 10
            : 0;
        const busyAgents = agents.filter(a => a.state === types_1.AgentState.BUSY).length;
        const agentUtilization = agents.length > 0
            ? Math.round((busyAgents / agents.length) * 100)
            : 0;
        return {
            totalCalls: allCalls.length,
            completedCalls: completedCalls.length,
            droppedCalls: droppedCalls.length,
            avgWaitTime,
            agentUtilization
        };
    }
}
exports.MetricsCollector = MetricsCollector;
