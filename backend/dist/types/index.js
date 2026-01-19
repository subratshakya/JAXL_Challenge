"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = exports.AgentState = exports.CallState = void 0;
var CallState;
(function (CallState) {
    CallState["DIALING"] = "DIALING";
    CallState["RINGING"] = "RINGING";
    CallState["CONNECTED"] = "CONNECTED";
    CallState["QUEUED"] = "QUEUED";
    CallState["COMPLETED"] = "COMPLETED";
    CallState["DROPPED"] = "DROPPED";
})(CallState || (exports.CallState = CallState = {}));
var AgentState;
(function (AgentState) {
    AgentState["AVAILABLE"] = "AVAILABLE";
    AgentState["BUSY"] = "BUSY";
})(AgentState || (exports.AgentState = AgentState = {}));
var EventType;
(function (EventType) {
    EventType["CALL_CREATED"] = "CALL_CREATED";
    EventType["CALL_STATE_CHANGED"] = "CALL_STATE_CHANGED";
    EventType["AGENT_STATE_CHANGED"] = "AGENT_STATE_CHANGED";
    EventType["CALL_QUEUED"] = "CALL_QUEUED";
    EventType["CALL_DEQUEUED"] = "CALL_DEQUEUED";
})(EventType || (exports.EventType = EventType = {}));
