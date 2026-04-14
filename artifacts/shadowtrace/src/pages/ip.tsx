import { useState } from "react";
import { useTrackIp } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Download, Network, ShieldAlert, Crosshair, Map, Ghost } from "lucide-react";
import { downloadJson } from "@/lib/export";

export default function IpTracker() {
  const [query, setQuery] = useState("");
  const searchMutation = useTrackIp();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    searchMutation.mutate({ data: { ip: query } });
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case "low": return "text-secondary border-secondary/50 bg-secondary/10";
      case "medium": return "text-yellow-400 border-yellow-400/50 bg-yellow-400/10";
      case "high": return "text-orange-500 border-orange-500/50 bg-orange-500/10";
      case "critical": return "text-destructive border-destructive/50 bg-destructive/10";
      default: return "text-primary border-primary/50 bg-primary/10";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary glow-text flex items-center gap-2">
          <MapPin className="h-8 w-8" /> IP TRACKER
        </h1>
        <p className="text-muted-foreground">Geolocate IP addresses and detect anonymizers</p>
      </div>

      <Card className="bg-card/40 border-border backdrop-blur">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Enter target IP address (e.g., 8.8.8.8)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono bg-black/50 border-primary/30 focus-visible:ring-primary text-primary placeholder:text-primary/30"
            />
            <Button type="submit" disabled={searchMutation.isPending} className="bg-primary/20 text-primary border border-primary hover:bg-primary/40 glow-border w-32">
              {searchMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span> SCANNING
                </span>
              ) : "INITIATE SCAN"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchMutation.data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="px-4 py-2 border border-border bg-black/40 rounded flex flex-col">
                <span className="text-[10px] uppercase text-muted-foreground">Target IP</span>
                <span className="font-mono text-lg font-bold">{searchMutation.data.ip}</span>
              </div>
              <div className={`px-4 py-2 border rounded flex flex-col ${getThreatColor(searchMutation.data.threatLevel)}`}>
                <span className="text-[10px] uppercase opacity-70">Threat Level</span>
                <span className="font-mono text-lg font-bold uppercase">{searchMutation.data.threatLevel}</span>
              </div>
              <div className={`px-4 py-2 border rounded flex flex-col ${searchMutation.data.riskScore > 50 ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-primary/50 bg-primary/10 text-primary'}`}>
                <span className="text-[10px] uppercase opacity-70">Risk Score</span>
                <span className="font-mono text-lg font-bold">{searchMutation.data.riskScore}/100</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => downloadJson(searchMutation.data, `ip-${searchMutation.data.ip.replace(/\./g, '-')}`)}
            >
              <Download className="h-4 w-4 mr-2" /> EXPORT JSON
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/40 border-border backdrop-blur md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
                  <Map className="h-5 w-5" /> Geolocation Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex flex-col bg-black/30 p-3 rounded border border-white/5">
                    <span className="text-muted-foreground text-[10px] uppercase">Country</span>
                    <span className="font-bold flex items-center gap-2 mt-1">
                      {searchMutation.data.country} <span className="text-muted-foreground font-mono text-xs">{searchMutation.data.countryCode}</span>
                    </span>
                  </div>
                  <div className="flex flex-col bg-black/30 p-3 rounded border border-white/5">
                    <span className="text-muted-foreground text-[10px] uppercase">Region</span>
                    <span className="font-bold mt-1">{searchMutation.data.region}</span>
                  </div>
                  <div className="flex flex-col bg-black/30 p-3 rounded border border-white/5">
                    <span className="text-muted-foreground text-[10px] uppercase">City</span>
                    <span className="font-bold mt-1">{searchMutation.data.city}</span>
                  </div>
                  <div className="flex flex-col bg-black/30 p-3 rounded border border-white/5">
                    <span className="text-muted-foreground text-[10px] uppercase">Timezone</span>
                    <span className="font-bold mt-1 text-sm">{searchMutation.data.timezone}</span>
                  </div>
                </div>

                <div className="relative w-full h-[200px] border border-primary/30 rounded bg-black/80 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMGZmODgiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4yIi8+PC9zdmc+')]"></div>
                  
                  <div className="z-10 flex flex-col items-center">
                    <Crosshair className="h-16 w-16 text-primary animate-pulse mb-2" />
                    <div className="bg-black/60 px-4 py-2 border border-primary/50 text-primary font-mono font-bold tracking-widest backdrop-blur">
                      LAT: {searchMutation.data.latitude.toFixed(4)} <br/>
                      LNG: {searchMutation.data.longitude.toFixed(4)}
                    </div>
                  </div>
                  
                  <div className="absolute top-1/2 left-0 w-full h-px bg-primary/30"></div>
                  <div className="absolute left-1/2 top-0 w-px h-full bg-primary/30"></div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-card/40 border-border backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
                    <Network className="h-5 w-5" /> Network Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col border-b border-white/10 pb-2">
                    <span className="text-muted-foreground text-[10px] uppercase">ISP</span>
                    <span className="font-bold">{searchMutation.data.isp}</span>
                  </div>
                  <div className="flex flex-col border-b border-white/10 pb-2">
                    <span className="text-muted-foreground text-[10px] uppercase">Organization</span>
                    <span className="font-bold">{searchMutation.data.org}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[10px] uppercase">ASN</span>
                    <span className="font-mono text-secondary">{searchMutation.data.asn}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
                    <Ghost className="h-5 w-5" /> Anonymization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded border border-white/5 bg-black/20">
                    <span className="font-medium text-sm">Proxy Detected</span>
                    {searchMutation.data.isProxy ? 
                      <span className="text-xs px-2 py-1 bg-destructive/20 text-destructive border border-destructive/30 rounded uppercase font-bold">Yes</span> : 
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded uppercase font-bold">No</span>}
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border border-white/5 bg-black/20">
                    <span className="font-medium text-sm">VPN Detected</span>
                    {searchMutation.data.isVpn ? 
                      <span className="text-xs px-2 py-1 bg-destructive/20 text-destructive border border-destructive/30 rounded uppercase font-bold">Yes</span> : 
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded uppercase font-bold">No</span>}
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border border-white/5 bg-black/20">
                    <span className="font-medium text-sm">TOR Node</span>
                    {searchMutation.data.isTor ? 
                      <span className="text-xs px-2 py-1 bg-destructive/20 text-destructive border border-destructive/30 rounded uppercase font-bold">Yes</span> : 
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded uppercase font-bold">No</span>}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-primary uppercase flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> Open Ports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {searchMutation.data.openPorts.length > 0 ? (
                      searchMutation.data.openPorts.map((port, i) => (
                        <span key={i} className="font-mono text-xs bg-destructive/10 p-1.5 rounded border border-destructive/30 text-destructive">
                          {port}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No open ports detected.</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
