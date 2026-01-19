export enum CallState {
  DIALING = 'DIALING',
  RINGING = 'RINGING',
  CONNECTED = 'CONNECTED',
  QUEUED = 'QUEUED',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED'
}

export enum AgentState {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY'
}

export interface Call {
  id: string;
  state: CallState;
  agentId?: string;
  createdAt: number;
  queuedAt?: number;
  connectedAt?: number;
  completedAt?: number;
}

export interface Agent {
  id: string;
  name: string;
  state: AgentState;
  callsHandled: number;
  currentCallId?: string;
}

export interface SystemState {
  agents: Agent[];
  calls: Call[];
  queueLength: number;
  generating: boolean;
  metrics?: Metrics;
}

export interface Metrics {
  totalCalls: number;
  completedCalls: number;
  droppedCalls: number;
  avgWaitTime: number;
  agentUtilization: number;
}

export enum EventType {
  CALL_CREATED = 'CALL_CREATED',
  CALL_STATE_CHANGED = 'CALL_STATE_CHANGED',
  AGENT_STATE_CHANGED = 'AGENT_STATE_CHANGED',
  CALL_QUEUED = 'CALL_QUEUED',
  CALL_DEQUEUED = 'CALL_DEQUEUED'
}

export interface Event {
  type: EventType;
  payload: any;
  timestamp: number;
}