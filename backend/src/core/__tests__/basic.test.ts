import { CallQueue } from '../CallQueue';
import { StateManager } from '../StateManager';
import { EventBus } from '../EventBus';
import { CallState, AgentState, EventType } from '../../types';

describe('CallQueue', () => {
  let queue: CallQueue;

  beforeEach(() => {
    queue = new CallQueue();
  });

  test('should enqueue and dequeue in FIFO order', () => {
    queue.enqueue('call-1');
    queue.enqueue('call-2');
    queue.enqueue('call-3');

    expect(queue.dequeue()).toBe('call-1');
    expect(queue.dequeue()).toBe('call-2');
    expect(queue.dequeue()).toBe('call-3');
  });

  test('should return correct length', () => {
    expect(queue.length()).toBe(0);
    queue.enqueue('call-1');
    expect(queue.length()).toBe(1);
    queue.enqueue('call-2');
    expect(queue.length()).toBe(2);
    queue.dequeue();
    expect(queue.length()).toBe(1);
  });

  test('should return undefined when empty', () => {
    expect(queue.dequeue()).toBeUndefined();
  });

  test('isEmpty should return correct boolean', () => {
    expect(queue.isEmpty()).toBe(true);
    queue.enqueue('call-1');
    expect(queue.isEmpty()).toBe(false);
    queue.dequeue();
    expect(queue.isEmpty()).toBe(true);
  });
});

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  test('should add and retrieve agents', () => {
    const agent = {
      id: 'agent-1',
      name: 'Test Agent',
      state: AgentState.AVAILABLE,
      callsHandled: 0
    };

    stateManager.addAgent(agent);
    const retrieved = stateManager.getAgent('agent-1');

    expect(retrieved).toEqual(agent);
  });

  test('should update agent state', () => {
    const agent = {
      id: 'agent-1',
      name: 'Test Agent',
      state: AgentState.AVAILABLE,
      callsHandled: 0
    };

    stateManager.addAgent(agent);
    stateManager.updateAgentState('agent-1', AgentState.BUSY);

    const updated = stateManager.getAgent('agent-1');
    expect(updated?.state).toBe(AgentState.BUSY);
  });

  test('should get available agents', () => {
    stateManager.addAgent({
      id: 'agent-1',
      name: 'Agent 1',
      state: AgentState.AVAILABLE,
      callsHandled: 0
    });

    stateManager.addAgent({
      id: 'agent-2',
      name: 'Agent 2',
      state: AgentState.BUSY,
      callsHandled: 0
    });

    stateManager.addAgent({
      id: 'agent-3',
      name: 'Agent 3',
      state: AgentState.AVAILABLE,
      callsHandled: 0
    });

    const available = stateManager.getAvailableAgents();
    expect(available.length).toBe(2);
    expect(available.map(a => a.id)).toContain('agent-1');
    expect(available.map(a => a.id)).toContain('agent-3');
  });

  test('should add and retrieve calls', () => {
    const call = {
      id: 'call-1',
      customerId: 'customer-1',
      state: CallState.DIALING,
      createdAt: Date.now()
    };

    stateManager.addCall(call);
    const retrieved = stateManager.getCall('call-1');

    expect(retrieved).toEqual(call);
  });

  test('should update call state and timestamps', () => {
    const call = {
      id: 'call-1',
      customerId: 'customer-1',
      state: CallState.DIALING,
      createdAt: Date.now()
    };

    stateManager.addCall(call);
    stateManager.updateCallState('call-1', CallState.QUEUED);

    const updated = stateManager.getCall('call-1');
    expect(updated?.state).toBe(CallState.QUEUED);
    expect(updated?.queuedAt).toBeDefined();
  });

  test('should assign call to agent', () => {
    const agent = {
      id: 'agent-1',
      name: 'Test Agent',
      state: AgentState.AVAILABLE,
      callsHandled: 0
    };

    const call = {
      id: 'call-1',
      customerId: 'customer-1',
      state: CallState.RINGING,
      createdAt: Date.now()
    };

    stateManager.addAgent(agent);
    stateManager.addCall(call);
    stateManager.assignCallToAgent('call-1', 'agent-1');

    const updatedAgent = stateManager.getAgent('agent-1');
    const updatedCall = stateManager.getCall('call-1');

    expect(updatedAgent?.currentCallId).toBe('call-1');
    expect(updatedCall?.agentId).toBe('agent-1');
  });

  test('should release agent and increment calls handled', () => {
    const agent = {
      id: 'agent-1',
      name: 'Test Agent',
      state: AgentState.BUSY,
      callsHandled: 5,
      currentCallId: 'call-1'
    };

    stateManager.addAgent(agent);
    stateManager.releaseAgent('agent-1');

    const updated = stateManager.getAgent('agent-1');
    expect(updated?.currentCallId).toBeUndefined();
    expect(updated?.callsHandled).toBe(6);
  });
});

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  test('should emit and receive events', (done) => {
    const payload = { callId: 'call-1' };

    eventBus.on(EventType.CALL_CREATED, (event) => {
      expect(event.type).toBe(EventType.CALL_CREATED);
      expect(event.payload).toEqual(payload);
      expect(event.timestamp).toBeDefined();
      done();
    });

    eventBus.emit(EventType.CALL_CREATED, payload);
  });

  test('should support multiple listeners', () => {
    let listener1Called = false;
    let listener2Called = false;

    eventBus.on(EventType.CALL_CREATED, () => {
      listener1Called = true;
    });

    eventBus.on(EventType.CALL_CREATED, () => {
      listener2Called = true;
    });

    eventBus.emit(EventType.CALL_CREATED, {});

    expect(listener1Called).toBe(true);
    expect(listener2Called).toBe(true);
  });

  test('should not trigger unrelated event listeners', () => {
    let wrongListenerCalled = false;

    eventBus.on(EventType.CALL_CREATED, () => {
      wrongListenerCalled = true;
    });

    eventBus.emit(EventType.AGENT_STATE_CHANGED, {});

    expect(wrongListenerCalled).toBe(false);
  });
});