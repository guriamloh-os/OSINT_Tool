import { Link, useLocation } from "wouter";
import { 
  Activity, 
  Search, 
  Mail, 
  Globe, 
  MapPin, 
  Phone, 
  FileJson, 
  FileText, 
  History, 
  MessageSquare,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/username", label: "Username OSINT", icon: Search },
  { href: "/email", label: "Email Intel", icon: Mail },
  { href: "/domain", label: "Domain Intel", icon: Globe },
  { href: "/ip", label: "IP Tracker", icon: MapPin },
  { href: "/phone", label: "Phone Lookup", icon: Phone },
  { href: "/metadata", label: "Metadata", icon: FileJson },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/history", label: "History", icon: History },
  { href: "/ai", label: "AI Assistant", icon: MessageSquare },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Terminal className="h-6 w-6 text-primary glow-text" />
          <h1 className="font-bold text-lg text-primary tracking-wider glow-text">SHADOWTRACE</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200",
                    isActive 
                      ? "bg-primary/20 text-primary glow-border" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive && "glow-text")} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border text-xs text-muted-foreground text-center">
          <p>SYSTEM ONLINE</p>
          <p className="text-[10px] opacity-50 mt-1">v1.0.4 - SECURE</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="bg-destructive/10 text-destructive text-xs py-1 px-4 text-center border-b border-destructive/20 uppercase tracking-widest font-bold">
          WARNING: This tool is for educational and legal OSINT investigations only
        </div>
        <div className="flex-1 overflow-y-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
