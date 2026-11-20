import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Cpu, 
  Server, 
  Zap, 
  Wifi, 
  AlertOctagon, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Radio, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { mockConnectors, ConnectorTelemetryItem } from '../data/mockAdminData';

export const SystemTelemetryView: React.FC = () => {
  const [connectors, setConnectors] = useState<ConnectorTelemetryItem[]>(mockConnectors);
  const [circuitBreakerActive, setCircuitBreakerActive] = useState<Record<string, boolean>>({
    SAHAMATI_AA: false,
    GSTN_GATEWAY: false,
    NPCI_UPI: false,
    DIGILOCKER: false,
  });

  const toggleCircuitBreaker = (name: string) => {
    setCircuitBreakerActive(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-forest bg-brand-forest/10 px-2 py-0.5 rounded-full">
              Infrastructure & Rails
            </span>
            <Badge variant="outline" className="border-emerald-600 text-emerald-700 bg-emerald-50 text-[11px]">
              <Wifi className="w-3 h-3 mr-1 inline" /> 4 of 4 Gateways Reached
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-charcoal">
            Connectors & Rail Resilience
          </h1>
          <p className="text-sm text-brand-charcoal/70">
            Real-time status of India Stack API rails (Sahamati AA, GSTN, UPI, DigiLocker), circuit breaker thresholds, and throughput latencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-brand-charcoal/20">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Ping All Endpoints
          </Button>
          <Button variant="primary" size="sm" className="bg-brand-forest text-white">
            <Zap className="w-4 h-4 mr-1.5" /> Synthetic Load Test
          </Button>
        </div>
      </div>

      {/* Real-time System Load Vitals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-brand-charcoal/10 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-brand-charcoal/60 mb-1">
            <span className="font-semibold">Average Gateway RTT</span>
            <Clock className="w-4 h-4 text-brand-forest" />
          </div>
          <div className="text-2xl font-bold font-mono text-brand-charcoal">492 ms</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Within SLA (&lt; 1,500 ms)</p>
        </Card>

        <Card className="p-4 border-brand-charcoal/10 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-brand-charcoal/60 mb-1">
            <span className="font-semibold">Live Ingestion Throughput</span>
            <Activity className="w-4 h-4 text-brand-forest" />
          </div>
          <div className="text-2xl font-bold font-mono text-brand-forest">142 req/sec</div>
          <p className="text-[11px] text-brand-charcoal/60 mt-1">Peak capacity 2,500 req/sec</p>
        </Card>

        <Card className="p-4 border-brand-charcoal/10 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-brand-charcoal/60 mb-1">
            <span className="font-semibold">Global System Availability</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">99.94%</div>
          <p className="text-[11px] text-brand-charcoal/60 mt-1">Past 30 rolling days</p>
        </Card>

        <Card className="p-4 border-brand-charcoal/10 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-brand-charcoal/60 mb-1">
            <span className="font-semibold">Circuit Breaker Protection</span>
            <AlertOctagon className="w-4 h-4 text-brand-terracotta" />
          </div>
          <div className="text-2xl font-bold font-mono text-brand-charcoal">ARMED</div>
          <p className="text-[11px] text-brand-charcoal/60 mt-1">Auto-fallback to cached statement analysis</p>
        </Card>
      </div>

      {/* Connectors Table & Interactive Circuit Breakers */}
      <Card className="border-brand-charcoal/10 shadow-subtle overflow-hidden">
        <CardHeader className="bg-brand-charcoal/[0.02] border-b border-brand-charcoal/10 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-brand-charcoal flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand-forest" /> External Gateway Connectors & Circuit Breakers
            </CardTitle>
            <span className="text-xs font-mono text-brand-charcoal/60">Institutional API Orchestration</span>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-charcoal/[0.03] border-b border-brand-charcoal/10 font-mono text-brand-charcoal/70 uppercase tracking-wider text-[11px]">
                <th className="p-3">Gateway Name</th>
                <th className="p-3">Integration Rail</th>
                <th className="p-3">Live Status</th>
                <th className="p-3">RTT Latency</th>
                <th className="p-3">30d Uptime</th>
                <th className="p-3">Circuit Breaker</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-charcoal/5 font-sans">
              {connectors.map((conn) => {
                const isTripped = circuitBreakerActive[conn.name];
                return (
                  <tr key={conn.name} className="hover:bg-brand-forest/[0.02] transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-brand-charcoal">{conn.displayName}</div>
                      <div className="text-[10px] font-mono text-brand-charcoal/50">{conn.name}</div>
                    </td>
                    <td className="p-3 font-mono text-brand-charcoal/70">{conn.protocol}</td>
                    <td className="p-3">
                      {isTripped ? (
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300 text-[10px]">
                          CIRCUIT OPEN (ISOLATED)
                        </Badge>
                      ) : conn.status === 'OPERATIONAL' ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">
                          OPERATIONAL
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-[10px]">
                          DEGRADED LATENCY
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <span className={conn.latencyMs > 1000 ? 'text-amber-700' : 'text-emerald-700'}>
                        {conn.latencyMs} ms
                      </span>
                    </td>
                    <td className="p-3 font-mono text-brand-charcoal/80">{conn.uptime30d}%</td>
                    <td className="p-3 font-mono text-[11px]">
                      {isTripped ? (
                        <span className="text-rose-600 font-bold">TRIPPED (Fallback Mode)</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">CLOSED (Normal Traffic)</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCircuitBreaker(conn.name)}
                        className={`h-7 text-[11px] font-mono ${
                          isTripped 
                            ? 'border-emerald-500 text-emerald-700 hover:bg-emerald-50' 
                            : 'border-rose-400 text-rose-700 hover:bg-rose-50'
                        }`}
                      >
                        {isTripped ? 'Reset Breaker' : 'Trip Breaker'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Architectural Boundaries & Backend Interface Notice */}
      <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-950 mb-0.5">Backend Infrastructure & Security Isolation Boundary</h4>
          <p className="leading-relaxed text-amber-800">
            Gateway protocol adapters, mutual TLS (mTLS) handshakes with Sahamati and GSTN, encryption at rest, and webhook ingestion endpoints are executed securely within the teammate's backend microservices. The frontend console displays real-time health telemetry and provides manual circuit breaker overrides for administrative isolation.
          </p>
        </div>
      </div>
    </div>
  );
};
