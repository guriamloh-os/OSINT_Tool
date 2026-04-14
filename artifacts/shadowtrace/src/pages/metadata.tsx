import { useState } from "react";
import { useExtractMetadata } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileJson, Download, FileType, HardDrive, MapPin, Camera, AlertTriangle } from "lucide-react";
import { downloadJson } from "@/lib/export";

export default function MetadataOsint() {
  const [url, setUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [fileType, setFileType] = useState("image/jpeg");
  
  const searchMutation = useExtractMetadata();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && !filename) return;
    
    searchMutation.mutate({ 
      data: { 
        url: url || undefined,
        filename: filename || undefined,
        fileType 
      } 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary glow-text flex items-center gap-2">
          <FileJson className="h-8 w-8" /> METADATA EXTRACTOR
        </h1>
        <p className="text-muted-foreground">Extract EXIF, GPS, and hidden metadata from files</p>
      </div>

      <Card className="bg-card/40 border-border backdrop-blur">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Target URL (e.g., https://example.com/image.jpg)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 font-mono bg-black/50 border-primary/30 focus-visible:ring-primary text-primary placeholder:text-primary/30"
            />
            <div className="flex gap-4">
              <Input
                placeholder="Simulate Filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-48 font-mono bg-black/50 border-primary/30 focus-visible:ring-primary text-primary placeholder:text-primary/30"
              />
              <select 
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-32 bg-black/50 border border-primary/30 rounded-md px-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              >
                <option value="image/jpeg">JPEG Image</option>
                <option value="image/png">PNG Image</option>
                <option value="application/pdf">PDF Document</option>
                <option value="application/msword">Word Doc</option>
              </select>
              <Button type="submit" disabled={searchMutation.isPending} className="bg-primary/20 text-primary border border-primary hover:bg-primary/40 glow-border w-32">
                {searchMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⟳</span> EXTRACTING
                  </span>
                ) : "EXTRACT"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {searchMutation.data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="px-4 py-2 border border-border bg-black/40 rounded flex flex-col">
                <span className="text-[10px] uppercase text-muted-foreground">File</span>
                <span className="font-mono text-lg font-bold">{searchMutation.data.filename}</span>
              </div>
              <div className={`px-4 py-2 border rounded flex flex-col ${searchMutation.data.riskScore > 50 ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-primary/50 bg-primary/10 text-primary'}`}>
                <span className="text-[10px] uppercase opacity-70">Risk Score</span>
                <span className="font-mono text-lg font-bold">{searchMutation.data.riskScore}/100</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => downloadJson(searchMutation.data, `meta-${searchMutation.data.filename}`)}
            >
              <Download className="h-4 w-4 mr-2" /> EXPORT JSON
            </Button>
          </div>

          {searchMutation.data.warnings.length > 0 && (
            <Card className="bg-destructive/10 border-destructive/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 text-destructive">
                  <AlertTriangle className="h-6 w-6 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold uppercase tracking-wider mb-2">Security Warnings</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm font-mono">
                      {searchMutation.data.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/40 border-border backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
                  <FileType className="h-5 w-5" /> File Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 border-b border-white/10">
                  <span className="text-muted-foreground text-sm uppercase">MIME Type</span>
                  <span className="font-mono text-sm">{searchMutation.data.fileType}</span>
                </div>
                <div className="flex justify-between items-center p-2 border-b border-white/10">
                  <span className="text-muted-foreground text-sm uppercase">Size</span>
                  <span className="font-mono text-sm">{searchMutation.data.fileSize}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
                  <HardDrive className="h-5 w-5" /> General Metadata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                  {Object.entries(searchMutation.data.metadata).map(([k, v], i) => (
                    <div key={i} className="flex flex-col bg-black/20 p-2 rounded border border-white/5">
                      <span className="text-muted-foreground text-[10px] uppercase">{k}</span>
                      <span className="font-mono text-sm break-all">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {searchMutation.data.exifData && (
              <Card className="bg-card/40 border-border backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg text-secondary uppercase flex items-center gap-2">
                    <Camera className="h-5 w-5" /> EXIF Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(searchMutation.data.exifData).map(([k, v], i) => (
                      <div key={i} className="flex flex-col bg-black/20 p-2 rounded border border-secondary/20">
                        <span className="text-secondary/70 text-[10px] uppercase">{k}</span>
                        <span className="font-mono text-sm">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {searchMutation.data.gpsCoordinates && (
              <Card className="bg-card/40 border-destructive/50 backdrop-blur relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-destructive pointer-events-none">
                  <MapPin className="h-32 w-32" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg text-destructive uppercase flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> GPS Location Extracted
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-black/40 rounded border border-destructive/30">
                      <span className="text-muted-foreground text-sm uppercase">Latitude</span>
                      <span className="font-mono text-lg font-bold text-destructive">{searchMutation.data.gpsCoordinates.latitude}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/40 rounded border border-destructive/30">
                      <span className="text-muted-foreground text-sm uppercase">Longitude</span>
                      <span className="font-mono text-lg font-bold text-destructive">{searchMutation.data.gpsCoordinates.longitude}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/40 rounded border border-destructive/30">
                      <span className="text-muted-foreground text-sm uppercase">Altitude</span>
                      <span className="font-mono text-lg text-destructive">{searchMutation.data.gpsCoordinates.altitude}m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
