import { useState } from "react";
import { 
  LayoutDashboard, 
  Coins, 
  Building2, 
  Wallet, 
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "tokens", icon: Coins, label: "Tokens" },
  { id: "exchanges", icon: Building2, label: "Exchanges" },
  { id: "wallet", icon: Wallet, label: "Wallet" },
  { id: "activity", icon: Activity, label: "Activity" },
];

export default function Sidebar({ activePage, setActivePage }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.aside 
      data-testid="sidebar"
      initial={false}
      animate={{ width: isExpanded ? 240 : 72 }}
      className="sidebar h-screen sticky top-0 flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-sm bg-primary/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <h1 className="font-mono font-bold text-lg text-white tracking-tight whitespace-nowrap">
                ARB BOT
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                BSC Arbitrage
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => setActivePage(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-sm
                transition-colors duration-200
                ${isActive 
                  ? "bg-primary/10 text-primary border border-primary/30" 
                  : "text-muted-foreground hover:bg-accent hover:text-white border border-transparent"
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Expand/Collapse toggle */}
      <div className="p-3 border-t border-border">
        <button
          data-testid="sidebar-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-sm text-muted-foreground hover:bg-accent hover:text-white transition-colors duration-200"
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm">Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
