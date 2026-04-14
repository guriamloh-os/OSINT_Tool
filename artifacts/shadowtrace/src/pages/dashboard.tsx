import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Search, ShieldAlert, Cpu, Terminal } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, BarChart, Bar } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

function isDashboardSummary(value: unknown): value is {
  totalSearches: number;
  activeModules: number;
  riskScore: number;
  threatLevel: string;
  weeklyActivity: Array<{ day: string; searches: number }>;
  activityByModule: Array<{ module: string; count: number }>;
  recentActivity: Array<{
    id: string | number;
    query: string;
    module: string;
    timestamp: string;
    riskScore: number;
    status: string;
  }>;
} {
  if (!value || typeof value !== "object") return false;

  const summary = value as Record<string, unknown>;
  return (
    typeof summary.totalSearches === "number" &&
    typeof summary.activeModules === "number" &&
    typeof summary.riskScore === "number" &&
    typeof summary.threatLevel === "string" &&
    Array.isArray(summary.weeklyActivity) &&
    Array.isArray(summary.activityByModule) &&
    Array.isArray(summary.recentActivity)
  );
}

export default function Dashboard() {
  const { data, error, isLoading } = useGetDashboardSummary();
  const summary = isDashboardSummary(data) ? data : null;

  if (isLoading || !summary) {
    if (error) {
      return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-primary glow-text flex items-center gap-2">
            <Activity className="h-8 w-8" /> SYSTEM OVERVIEW
          </h1>
          <Card className="bg-card/40 border-yellow-500/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-yellow-400 uppercase flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Backend Not Connected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                The frontend is deployed, but live OSINT data is unavailable because the API is not reachable from this Netlify site.
              </p>
              <p>
                Deploy the backend and point the frontend API requests to it to enable dashboard stats and search tools.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary glow-text flex items-center gap-2">
          <Activity className="h-8 w-8" /> SYSTEM OVERVIEW
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 bg-card/50" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] bg-card/50" />
          <Skeleton className="h-[400px] bg-card/50" />
        </div>
      </div>
    );
  }

  const getThreatColor = (level: string) => {
    switch (level) {
      case "low": return "text-secondary";
      case "medium": return "text-yellow-400";
      case "high": return "text-orange-500";
      case "critical": return "text-destructive";
      default: return "text-primary";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary glow-text flex items-center gap-2">
          <Activity className="h-8 w-8" /> SYSTEM OVERVIEW
        </h1>
        <div className="flex items-center gap-2 text-xs">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span className="text-primary font-mono">LIVE FEED ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 border-border backdrop-blur glow-border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Search className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{summary.totalSearches}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Active Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{summary.activeModules}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Avg Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-400">{summary.riskScore.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-destructive/30 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Global Threat Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold uppercase ${getThreatColor(summary.threatLevel)}`}>
              {summary.threatLevel}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/40 border-border backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
              <Activity className="h-5 w-5" /> Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid rgba(0,255,136,0.3)' }}
                    itemStyle={{ color: '#00ff88' }}
                  />
                  <Area type="monotone" dataKey="searches" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSearches)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
              <Cpu className="h-5 w-5" /> Module Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.activityByModule} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="module" type="category" stroke="#aaa" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid rgba(0,255,136,0.3)' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40 border-border backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
            <Terminal className="h-5 w-5" /> Recent Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.recentActivity.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 border border-white/5 rounded bg-black/20 hover:bg-white/5 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">{entry.query}</span>
                  <span className="text-xs text-muted-foreground uppercase">{entry.module} • {format(new Date(entry.timestamp), 'HH:mm:ss')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground uppercase">Risk</span>
                    <span className={`text-sm font-mono ${entry.riskScore > 70 ? 'text-destructive' : entry.riskScore > 40 ? 'text-yellow-400' : 'text-primary'}`}>
                      {entry.riskScore}
                    </span>
                  </div>
                  <div className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${entry.status === 'completed' ? 'border-primary/50 text-primary' : 'border-destructive/50 text-destructive'}`}>
                    {entry.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
