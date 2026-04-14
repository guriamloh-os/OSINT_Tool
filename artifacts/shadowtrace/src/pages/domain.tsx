import { useState } from "react";
import { useDomainLookup } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Download, Server, Lock, Network, Code } from "lucide-react";
import { downloadJson } from "@/lib/export";
import { format } from "date-fns";

export default function DomainOsint() {
  const [query, setQuery] = useState("");
  const searchMutation = useDomainLookup();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    searchMutation.mutate({ data: { domain: query } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary glow-text flex items-center gap-2">
          <Globe className="h-8 w-8" /> DOMAIN INTELLIGENCE
        </h1>
        <p className="text-muted-foreground">Analyze WHOIS, DNS records, and infrastructure</p>
      </div>

      <Card className="bg-card/40 border-border backdrop-blur">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Enter target domain (e.g., example.com)..."
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
                <span className="text-[10px] uppercase text-muted-foreground">Target</span>
                <span className="font-mono text-lg font-bold">{searchMutation.data.domain}</span>
              </div>
              <div className={`px-4 py-2 border rounded flex flex-col ${searchMutation.data.riskScore > 50 ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-primary/50 bg-primary/10 text-primary'}`}>
                <span className="text-[10px] uppercase opacity-70">Risk Score</span>
                <span className="font-mono text-lg font-bold">{searchMutation.data.riskScore}/100</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => downloadJson(searchMutation.data, `domain-${searchMutation.data.domain}`)}
            >
              <Download className="h-4 w-4 mr-2" /> EXPORT JSON
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/40 border-border backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
                  <Server className="h-5 w-5" /> WHOIS Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col bg-black/30 p-2 rounded border border-white/5">
                    <span className="text-muted-foreground text-[10px] uppercase">Registrar</span>
                    <span className="font-medium">{searchMutation.data.whois.registrar}</span>
                  </div>
                  <div className="flex flex-col bg-black/30 p-2 rounded border border-white/5">
                    <span className="text-muted-foreground text-[10px] uppercase">Registrant Org</span>
                    <span className="font-medium">{searchMutation.data.whois.registrant}</span>
                  </div>
                  <div className="flex flex-col bg-black/30 p-2 rounded border border-white/5">
                    <span className="text-muted-foreground text-[10px] uppercase">Created</span>
                    <span className="font-mono text-xs mt-1">{format(new Date(searchMutation.data.whois.createdDate), 'PP')}</span>
                  </div>
                  <div className="flex flex-col bg-black/30 p-2 rounded border border-white/5">
                    <span className="text-muted-foreground text-[10px] uppercase">Expires</span>
                    <span className="font-mono text-xs mt-1">{format(new Date(searchMutation.data.whois.expiryDate), 'PP')}</span>
                  </div>
                  <div className="flex flex-col bg-black/30 p-2 rounded border border-white/5">
                    <span className="text-muted-foreground text-[10px] uppercase">Country</span>
                    <span className="font-medium">{searchMutation.data.whois.country}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="text-muted-foreground text-[10px] uppercase mb-1 block">Nameservers</span>
                  <div className="space-y-1">
                    {searchMutation.data.whois.nameservers.map((ns, i) => (
                      <div key={i} className="font-mono text-xs bg-black/40 p-1.5 rounded border border-white/5 text-primary">{ns}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
                  <Lock className="h-5 w-5" /> SSL Certificate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`p-3 rounded border ${searchMutation.data.sslInfo.valid ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-destructive/10 border-destructive/30 text-destructive'} flex items-center justify-between`}>
                  <span className="font-bold uppercase text-sm">Status</span>
                  <span className="font-mono">{searchMutation.data.sslInfo.valid ? 'VALID' : 'INVALID / EXPIRED'}</span>
                </div>
                <div className="flex flex-col bg-black/30 p-2 rounded border border-white/5">
                  <span className="text-muted-foreground text-[10px] uppercase">Issuer</span>
                  <span className="font-medium text-sm">{searchMutation.data.sslInfo.issuer}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col bg-black/30 p-2 rounded border border-white/5">
                    <span className="text-muted-foreground text-[10px] uppercase">Valid From</span>
                    <span className="font-mono text-xs mt-1">{format(new Date(searchMutation.data.sslInfo.validFrom), 'PP')}</span>
                  </div>
                  <div className="flex flex-col bg-black/30 p-2 rounded border border-white/5">
                    <span className="text-muted-foreground text-[10px] uppercase">Valid To</span>
                    <span className="font-mono text-xs mt-1">{format(new Date(searchMutation.data.sslInfo.validTo), 'PP')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border backdrop-blur md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
                  <Network className="h-5 w-5" /> DNS Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(searchMutation.data.dnsRecords).map(([type, records]) => (
                    <div key={type} className="flex flex-col">
                      <span className="text-primary font-bold mb-2 border-b border-primary/30 pb-1">{type} Records</span>
                      <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                        {records.length > 0 ? (
                          records.map((r, i) => (
                            <div key={i} className="font-mono text-[10px] break-all bg-black/40 p-1.5 rounded border border-white/5 text-muted-foreground">
                              {r}
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground/50 italic">None found</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
                  <Globe className="h-5 w-5" /> Discovered Subdomains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {searchMutation.data.subdomains.map((sub, i) => (
                    <span key={i} className="font-mono text-xs bg-black/40 p-1.5 rounded border border-white/5 text-secondary">
                      {sub}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
                  <Code className="h-5 w-5" /> Technologies Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {searchMutation.data.technologies.map((tech, i) => (
                    <span key={i} className="text-xs bg-white/5 p-1.5 rounded border border-white/10 text-foreground font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
