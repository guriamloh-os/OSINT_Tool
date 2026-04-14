import { useState } from "react";
import { useEmailIntelligence } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Download, AlertTriangle, CheckCircle, XCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { downloadJson } from "@/lib/export";
import { format } from "date-fns";

export default function EmailOsint() {
  const [query, setQuery] = useState("");
  const searchMutation = useEmailIntelligence();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    searchMutation.mutate({ data: { email: query } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary glow-text flex items-center gap-2">
          <Mail className="h-8 w-8" /> EMAIL INTELLIGENCE
        </h1>
        <p className="text-muted-foreground">Verify validity, check reputation, and find known breaches</p>
      </div>

      <Card className="bg-card/40 border-border backdrop-blur">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              type="email"
              placeholder="Enter target email address..."
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
                <span className="font-mono text-lg font-bold">{searchMutation.data.email}</span>
              </div>
              <div className={`px-4 py-2 border rounded flex flex-col ${searchMutation.data.reputation === 'clean' ? 'border-primary/50 bg-primary/10' : searchMutation.data.reputation === 'suspicious' ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500' : 'border-destructive/50 bg-destructive/10 text-destructive'}`}>
                <span className="text-[10px] uppercase opacity-70">Reputation</span>
                <span className="font-mono text-lg font-bold capitalize">{searchMutation.data.reputation}</span>
              </div>
              <div className={`px-4 py-2 border rounded flex flex-col ${searchMutation.data.riskScore > 50 ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-primary/50 bg-primary/10 text-primary'}`}>
                <span className="text-[10px] uppercase opacity-70">Risk Score</span>
                <span className="font-mono text-lg font-bold">{searchMutation.data.riskScore}/100</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => downloadJson(searchMutation.data, `email-${searchMutation.data.email}`)}
            >
              <Download className="h-4 w-4 mr-2" /> EXPORT JSON
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/40 border-border backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-primary uppercase">Validity & Domain Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-muted-foreground">Format Valid</span>
                  {searchMutation.data.isValid ? <CheckCircle className="text-primary h-5 w-5" /> : <XCircle className="text-destructive h-5 w-5" />}
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-muted-foreground">Disposable Email</span>
                  {searchMutation.data.disposable ? <AlertTriangle className="text-destructive h-5 w-5" /> : <CheckCircle className="text-primary h-5 w-5" />}
                </div>
                <div className="flex flex-col border-b border-white/10 pb-2">
                  <span className="text-muted-foreground mb-1">Domain</span>
                  <span className="font-mono text-foreground">{searchMutation.data.domain}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground mb-1">MX Records</span>
                  <div className="space-y-1">
                    {searchMutation.data.mxRecords.length > 0 ? (
                      searchMutation.data.mxRecords.map((mx, i) => (
                        <div key={i} className="font-mono text-sm bg-black/40 p-2 rounded border border-white/5">{mx}</div>
                      ))
                    ) : (
                      <span className="text-destructive font-mono text-sm">No MX records found</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-card/40 backdrop-blur ${searchMutation.data.breaches.length > 0 ? 'border-destructive/50' : 'border-primary/30'}`}>
              <CardHeader>
                <CardTitle className={`text-lg uppercase flex items-center gap-2 ${searchMutation.data.breaches.length > 0 ? 'text-destructive' : 'text-primary'}`}>
                  {searchMutation.data.breaches.length > 0 ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                  Known Breaches ({searchMutation.data.breaches.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {searchMutation.data.breaches.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {searchMutation.data.breaches.map((breach, i) => (
                      <div key={i} className="border border-white/10 rounded p-3 bg-black/20">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-destructive">{breach.name}</span>
                          <span className={`text-xs px-2 py-1 rounded uppercase ${
                            breach.severity === 'critical' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                            breach.severity === 'high' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                            breach.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                            'bg-primary/20 text-primary border border-primary/30'
                          }`}>
                            {breach.severity}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Date: {format(new Date(breach.date), 'PP')}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {breach.dataClasses.map((dc, j) => (
                            <span key={j} className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-muted-foreground">
                              {dc}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-primary">
                    <ShieldCheck className="h-12 w-12 mb-2 opacity-50" />
                    <p>No known breaches found for this email.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
