import React, { useState, useEffect } from 'react';
import { Phone, Users, Clock, Activity, TrendingUp, Power } from 'lucide-react';

const BACKEND_URL = 'ws://localhost:3001';

const CallRoutingSystem = () => {
  const [agents, setAgents] = useState([]);
  const [calls, setCalls] = useState([]);
  const [queueLength, setQueueLength] = useState(0);
  const [metrics, setMetrics] = useState(null);
  const [connected, setConnected] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(BACKEND_URL);

    ws.onopen = () => {
      setConnected(true);
      console.log('Connected to backend');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'STATE_UPDATE':
          setAgents(data.payload.agents);
          setCalls(data.payload.calls);
          setQueueLength(data.payload.queueLength);
          setMetrics(data.payload.metrics);
          setGenerating(data.payload.generating);
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('Disconnected from backend');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, []);

  const callsByState = calls.reduce((acc, call) => {
    if (!acc[call.state]) acc[call.state] = [];
    acc[call.state].push(call);
    return acc;
  }, {});

  const getStateColor = (state) => {
    const colors = {
      AVAILABLE: 'bg-green-100 text-green-800 border-green-300',
      BUSY: 'bg-red-100 text-red-800 border-red-300',
      DIALING: 'bg-blue-100 text-blue-800 border-blue-300',
      RINGING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      CONNECTED: 'bg-green-100 text-green-800 border-green-300',
      QUEUED: 'bg-orange-100 text-orange-800 border-orange-300',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-300',
      DROPPED: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[state] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getAgentCall = (agentId) => {
    return calls.find(call => call.agentId === agentId && call.state === 'CONNECTED');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Phone className="w-8 h-8" />
                Call Routing System
              </h1>
              <p className="text-gray-600 mt-1">Real-time call distribution and agent management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {connected ? 'Connected' : 'Disconnected'}
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${generating ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                <Power className="w-4 h-4" />
                {generating ? 'Generating' : 'Stopped'}
              </div>
            </div>
          </div>
        </div>

        {metrics && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalCalls}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.completedCalls}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Wait Time</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.avgWaitTime}s</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Agent Utilization</p>
                  <p className="text-2xl font-bold text-purple-600">{metrics.agentUtilization}%</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Agents ({agents.length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {agents.map(agent => {
                  const assignedCall = getAgentCall(agent.id);
                  return (
                    <div key={agent.id} className={`p-4 rounded-lg border-2 ${getStateColor(agent.state)}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{agent.name}</p>
                          <p className="text-sm opacity-75">{agent.state}</p>
                          {assignedCall && (
                            <p className="text-xs mt-1 opacity-75">
                              Handling: Call #{assignedCall.id.slice(-6)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-75">Handled</p>
                          <p className="font-bold">{agent.callsHandled}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Active Calls ({calls.filter(c => !['COMPLETED', 'DROPPED'].includes(c.state)).length})
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Queue</h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                    {queueLength} waiting
                  </span>
                </div>
                {callsByState.QUEUED && callsByState.QUEUED.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {callsByState.QUEUED.map(call => (
                      <div key={call.id} className={`p-3 rounded-lg border ${getStateColor(call.state)} text-sm`}>
                        Call #{call.id.slice(-6)} - Waiting {Math.floor((Date.now() - call.queuedAt) / 1000)}s
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {['DIALING', 'RINGING', 'CONNECTED'].map(state => (
                  callsByState[state] && callsByState[state].length > 0 && (
                    <div key={state}>
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        {state}
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                          {callsByState[state].length}
                        </span>
                      </h3>
                      <div className="space-y-2">
                        {callsByState[state].map(call => (
                          <div key={call.id} className={`p-3 rounded-lg border ${getStateColor(call.state)} text-sm`}>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Call #{call.id.slice(-6)}</span>
                              {call.agentId && (
                                <span className="text-xs opacity-75">
                                  Agent: {agents.find(a => a.id === call.agentId)?.name}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>System Active:</strong> Calls are being generated automatically. 
            Agents are routing calls in real-time with FIFO queue management.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallRoutingSystem;