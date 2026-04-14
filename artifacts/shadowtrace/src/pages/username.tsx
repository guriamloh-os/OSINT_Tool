import { useState } from "react";
import { useSearchUsername } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { downloadJson } from "@/lib/export";
import { SiGithub, SiInstagram, SiReddit, SiTiktok, SiX } from "react-icons/si";
import { Globe } from "lucide-react";

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toLowerCase()) {
    case 'github': return <SiGithub className="h-5 w-5" />;
    case 'twitter': return <SiX className="h-5 w-5" />;
    case 'instagram': return <SiInstagram className="h-5 w-5" />;
    case 'linkedin': return <Globe className="h-5 w-5" />;
    case 'reddit': return <SiReddit className="h-5 w-5" />;
    case 'tiktok': return <SiTiktok className="h-5 w-5" />;
    default: return <Search className="h-5 w-5" />;
  }
};

export default function UsernameOsint() {
  const [query, setQuery] = useState("");
  const searchMutation = useSearchUsername();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    searchMutation.mutate({ data: { username: query } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary glow-text flex items-center gap-2">
          <Search className="h-8 w-8" /> USERNAME OSINT
        </h1>
        <p className="text-muted-foreground">Scan digital footprint across major platforms</p>
      </div>

      <Card className="bg-card/40 border-border backdrop-blur">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Enter target username..."
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
                <span className="font-mono text-lg font-bold">@{searchMutation.data.username}</span>
              </div>
              <div className="px-4 py-2 border border-border bg-black/40 rounded flex flex-col">
                <span className="text-[10px] uppercase text-muted-foreground">Found Profiles</span>
                <span className="font-mono text-lg font-bold text-primary">{searchMutation.data.totalFound}</span>
              </div>
              <div className={`px-4 py-2 border rounded flex flex-col ${searchMutation.data.riskScore > 50 ? 'border-destructive/50 bg-destructive/10' : 'border-primary/50 bg-primary/10'}`}>
                <span className="text-[10px] uppercase opacity-70">Risk Score</span>
                <span className="font-mono text-lg font-bold">{searchMutation.data.riskScore}/100</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => downloadJson(searchMutation.data, `username-${searchMutation.data.username}`)}
            >
              <Download className="h-4 w-4 mr-2" /> EXPORT JSON
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchMutation.data.platforms.map((platform, i) => (
              <Card key={i} className={`bg-card/40 border-border backdrop-blur ${platform.status === 'found' ? 'border-primary/30' : ''}`}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 capitalize">
                    <PlatformIcon platform={platform.platform} />
                    {platform.platform}
                  </CardTitle>
                  {platform.status === 'found' ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : platform.status === 'error' ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent>
                  {platform.status === 'found' ? (
                    <div className="space-y-3">
                      <a href={platform.url} target="_blank" rel="noreferrer" className="text-xs text-secondary hover:underline font-mono truncate block">
                        {platform.url}
                      </a>
                      {platform.profileData && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {platform.profileData.displayName && (
                            <div className="col-span-2 border border-white/5 p-2 rounded bg-black/20">
                              <span className="text-muted-foreground block mb-1">Name</span>
                              <span className="font-bold">{platform.profileData.displayName}</span>
                            </div>
                          )}
                          {platform.profileData.followers !== undefined && (
                            <div className="border border-white/5 p-2 rounded bg-black/20">
                              <span className="text-muted-foreground block mb-1">Followers</span>
                              <span className="font-mono">{platform.profileData.followers.toLocaleString()}</span>
                            </div>
                          )}
                          {platform.profileData.following !== undefined && (
                            <div className="border border-white/5 p-2 rounded bg-black/20">
                              <span className="text-muted-foreground block mb-1">Following</span>
                              <span className="font-mono">{platform.profileData.following.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No profile found on this platform.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
