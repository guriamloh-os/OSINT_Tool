import { useState } from "react";
import { useListReports, useGenerateReport } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Plus, Download, Calendar, Target } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { getListReportsQueryKey } from "@workspace/api-client-react";

const availableModules = [
  { id: "username", label: "Username Analysis" },
  { id: "email", label: "Email Intelligence" },
  { id: "domain", label: "Domain Infrastructure" },
  { id: "ip", label: "IP Geolocation" },
  { id: "phone", label: "Phone Lookup" },
  { id: "metadata", label: "Metadata Extraction" }
];

export default function Reports() {
  const queryClient = useQueryClient();
  const { data: reports, isLoading: reportsLoading } = useListReports();
  const generateMutation = useGenerateReport();

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>(["username", "email"]);
  const [includeHistory, setIncludeHistory] = useState(false);

  const toggleModule = (id: string) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !target || selectedModules.length === 0) return;

    generateMutation.mutate({
      data: { title, target, modules: selectedModules, includeHistory }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
        setTitle("");
        setTarget("");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary glow-text flex items-center gap-2">
          <FileText className="h-8 w-8" /> INTELLIGENCE REPORTS
        </h1>
        <p className="text-muted-foreground">Compile findings into comprehensive briefing documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card/40 border-primary/50 backdrop-blur glow-border lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-primary uppercase flex items-center gap-2">
              <Plus className="h-5 w-5" /> Generate New Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase text-muted-foreground font-bold">Operation Title</label>
                <Input
                  required
                  placeholder="e.g., Op. Shadow Hunt"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-black/50 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs uppercase text-muted-foreground font-bold">Primary Target</label>
                <Input
                  required
                  placeholder="Username, domain, email..."
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-black/50 border-white/10"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs uppercase text-muted-foreground font-bold">Include Modules</label>
                <div className="space-y-2 border border-white/5 p-3 rounded bg-black/20">
                  {availableModules.map((module) => (
                    <div key={module.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={module.id} 
                        checked={selectedModules.includes(module.id)}
                        onCheckedChange={() => toggleModule(module.id)}
                        className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                      />
                      <label htmlFor={module.id} className="text-sm font-medium leading-none cursor-pointer">
                        {module.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="history" 
                  checked={includeHistory}
                  onCheckedChange={(checked) => setIncludeHistory(checked as boolean)}
                  className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                />
                <label htmlFor="history" className="text-sm font-medium leading-none cursor-pointer">
                  Append recent search history
                </label>
              </div>

              <Button 
                type="submit" 
                disabled={generateMutation.isPending || !title || !target || selectedModules.length === 0} 
                className="w-full bg-primary text-black hover:bg-primary/90 font-bold tracking-widest mt-4"
              >
                {generateMutation.isPending ? "COMPILING..." : "COMPILE REPORT"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border backdrop-blur lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg uppercase flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" /> Report Archive
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded animate-pulse" />)}
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 rounded border border-white/5 bg-black/30 hover:bg-black/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between md:justify-start gap-4">
                        <h3 className="font-bold text-lg text-primary">{report.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded font-mono ${report.riskScore > 50 ? 'bg-destructive/20 text-destructive border border-destructive/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                          Risk: {report.riskScore}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono">
                          <Target className="h-3 w-3" /> {report.target}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {format(new Date(report.createdAt), 'PP p')}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-wrap pt-1">
                        {report.modules.map(m => (
                          <span key={m} className="text-[9px] uppercase px-1.5 py-0.5 border border-white/10 rounded bg-white/5">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 shrink-0">
                      <Download className="h-4 w-4 mr-2" /> PDF
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No reports generated yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
