import { useState } from "react";
import { useGetSearchHistory, useClearSearchHistory, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Trash2, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { getGetSearchHistoryQueryKey } from "@workspace/api-client-react";

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [filterModule, setFilterModule] = useState<string | undefined>(undefined);
  
  const { data: history, isLoading } = useGetSearchHistory({ module: filterModule });
  const clearMutation = useClearSearchHistory();

  const handleClear = () => {
    if (confirm("Are you sure you want to wipe all search history? This cannot be undone.")) {
      clearMutation.mutate(undefined, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSearchHistoryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary glow-text flex items-center gap-2">
            <History className="h-8 w-8" /> OPERATION LOGS
          </h1>
          <p className="text-muted-foreground">Immutable record of all OSINT queries</p>
        </div>
        
        <Button 
          variant="destructive" 
          onClick={handleClear}
          disabled={clearMutation.isPending || !history?.length}
          className="bg-destructive/20 text-destructive border border-destructive hover:bg-destructive/40"
        >
          <Trash2 className="h-4 w-4 mr-2" /> WIPE LOGS
        </Button>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar">
        <Button 
          variant={filterModule === undefined ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilterModule(undefined)}
          className={filterModule === undefined ? "bg-primary text-black" : "border-white/10 text-muted-foreground"}
        >
          ALL
        </Button>
        {["username", "email", "domain", "ip", "phone", "metadata"].map(mod => (
          <Button 
            key={mod}
            variant={filterModule === mod ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilterModule(mod)}
            className={`uppercase ${filterModule === mod ? "bg-primary text-black" : "border-white/10 text-muted-foreground"}`}
          >
            {mod}
          </Button>
        ))}
      </div>

      <Card className="bg-card/40 border-border backdrop-blur">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}
            </div>
          ) : history && history.length > 0 ? (
            <div className="divide-y divide-white/5">
              <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold uppercase text-muted-foreground bg-black/40">
                <div className="col-span-3 lg:col-span-2">Timestamp</div>
                <div className="col-span-2 lg:col-span-2">Module</div>
                <div className="col-span-4 lg:col-span-5">Query Target</div>
                <div className="col-span-1 lg:col-span-1 text-center">Risk</div>
                <div className="col-span-2 lg:col-span-2 text-right">Status</div>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                {history.map((entry) => (
                  <div key={entry.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors font-mono text-sm">
                    <div className="col-span-3 lg:col-span-2 text-xs text-muted-foreground">
                      {format(new Date(entry.timestamp), 'MM/dd HH:mm:ss')}
                    </div>
                    <div className="col-span-2 lg:col-span-2 text-secondary uppercase text-xs">
                      {entry.module}
                    </div>
                    <div className="col-span-4 lg:col-span-5 font-bold truncate">
                      {entry.query}
                    </div>
                    <div className={`col-span-1 lg:col-span-1 text-center ${entry.riskScore > 50 ? 'text-destructive' : 'text-primary'}`}>
                      {entry.riskScore}
                    </div>
                    <div className="col-span-2 lg:col-span-2 flex justify-end">
                      <span className={`text-[10px] px-2 py-1 rounded uppercase ${
                        entry.status === 'completed' ? 'bg-primary/10 text-primary border border-primary/30' : 
                        entry.status === 'failed' ? 'bg-destructive/10 text-destructive border border-destructive/30' :
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
              <Search className="h-12 w-12 mb-4 opacity-20" />
              <p>No records found in the database.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
