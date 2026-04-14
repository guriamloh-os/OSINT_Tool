import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import UsernameOsint from "@/pages/username";
import EmailOsint from "@/pages/email";
import DomainOsint from "@/pages/domain";
import IpTracker from "@/pages/ip";
import PhoneOsint from "@/pages/phone";
import MetadataOsint from "@/pages/metadata";
import Reports from "@/pages/reports";
import HistoryPage from "@/pages/history";
import AiAssistant from "@/pages/ai";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/username" component={UsernameOsint} />
        <Route path="/email" component={EmailOsint} />
        <Route path="/domain" component={DomainOsint} />
        <Route path="/ip" component={IpTracker} />
        <Route path="/phone" component={PhoneOsint} />
        <Route path="/metadata" component={MetadataOsint} />
        <Route path="/reports" component={Reports} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/ai" component={AiAssistant} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
