import { useState } from "react";
import { usePhoneLookup } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, Download, AlertTriangle, CheckCircle, XCircle, MapPin, Signal } from "lucide-react";
import { downloadJson } from "@/lib/export";

export default function PhoneOsint() {
  const [query, setQuery] = useState("");
  const searchMutation = usePhoneLookup();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    searchMutation.mutate({ data: { phone: query } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary glow-text flex items-center gap-2">
          <Phone className="h-8 w-8" /> PHONE LOOKUP
        </h1>
        <p className="text-muted-foreground">Analyze phone number details, carrier, and spam risk</p>
      </div>

      <Card className="bg-card/40 border-border backdrop-blur">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Enter target phone number (e.g., +1234567890)..."
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
                <span className="text-[10px] uppercase text-muted-foreground">Target Number</span>
                <span className="font-mono text-lg font-bold">{searchMutation.data.phone}</span>
              </div>
              <div className={`px-4 py-2 border rounded flex flex-col ${searchMutation.data.valid ? 'border-primary/50 bg-primary/10 text-primary' : 'border-destructive/50 bg-destructive/10 text-destructive'}`}>
                <span className="text-[10px] uppercase opacity-70">Status</span>
                <span className="font-mono text-lg font-bold uppercase">{searchMutation.data.valid ? 'VALID' : 'INVALID'}</span>
              </div>
              <div className={`px-4 py-2 border rounded flex flex-col ${searchMutation.data.riskScore > 50 ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-primary/50 bg-primary/10 text-primary'}`}>
                <span className="text-[10px] uppercase opacity-70">Risk Score</span>
                <span className="font-mono text-lg font-bold">{searchMutation.data.riskScore}/100</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => downloadJson(searchMutation.data, `phone-${searchMutation.data.phone.replace(/\D/g, '')}`)}
            >
              <Download className="h-4 w-4 mr-2" /> EXPORT JSON
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/40 border-border backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
                  <Signal className="h-5 w-5" /> Provider Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col bg-black/30 p-3 rounded border border-white/5">
                  <span className="text-muted-foreground text-[10px] uppercase">Carrier</span>
                  <span className="font-bold text-lg mt-1 text-secondary">{searchMutation.data.carrier}</span>
                </div>
                <div className="flex flex-col bg-black/30 p-3 rounded border border-white/5">
                  <span className="text-muted-foreground text-[10px] uppercase">Line Type</span>
                  <span className="font-bold uppercase mt-1 tracking-wider">{searchMutation.data.lineType}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col bg-black/30 p-3 rounded border border-white/5">
                  <span className="text-muted-foreground text-[10px] uppercase">Country</span>
                  <span className="font-bold text-lg mt-1 flex items-center gap-2">
                    {searchMutation.data.country}
                    <span className="font-mono text-sm text-muted-foreground">{searchMutation.data.countryCode}</span>
                  </span>
                </div>
                <div className="flex flex-col bg-black/30 p-3 rounded border border-white/5">
                  <span className="text-muted-foreground text-[10px] uppercase">Region / City</span>
                  <span className="font-bold mt-1">{searchMutation.data.region}</span>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-card/40 backdrop-blur md:col-span-2 ${searchMutation.data.spamScore > 50 ? 'border-destructive/50' : 'border-border'}`}>
              <CardHeader>
                <CardTitle className={`text-lg uppercase flex items-center gap-2 ${searchMutation.data.spamScore > 50 ? 'text-destructive' : 'text-primary'}`}>
                  <AlertTriangle className="h-5 w-5" /> Spam Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center justify-center p-6 bg-black/40 rounded-full border border-white/5 w-32 h-32">
                    <span className={`text-4xl font-mono font-bold ${
                      searchMutation.data.spamScore > 75 ? 'text-destructive' : 
                      searchMutation.data.spamScore > 40 ? 'text-yellow-500' : 'text-primary'
                    }`}>
                      {searchMutation.data.spamScore}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase mt-1">Spam Score</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="w-full h-4 bg-black rounded-full overflow-hidden border border-white/10">
                      <div 
                        className={`h-full ${
                          searchMutation.data.spamScore > 75 ? 'bg-destructive' : 
                          searchMutation.data.spamScore > 40 ? 'bg-yellow-500' : 'bg-primary'
                        }`} 
                        style={{ width: `${searchMutation.data.spamScore}%` }}
                      ></div>
                    </div>
                    <div className="p-4 bg-black/20 rounded border border-white/5">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {searchMutation.data.spamScore > 75 
                          ? "CRITICAL: This number has been highly flagged as spam, robocalling, or malicious activity by community reports." 
                          : searchMutation.data.spamScore > 40 
                          ? "WARNING: Moderate spam reports associated with this number. Proceed with caution." 
                          : "CLEAN: Minimal or no spam reports associated with this number in our databases."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
