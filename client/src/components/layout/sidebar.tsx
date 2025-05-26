import React from 'react';
import { 
  Code, Database, Users, ShoppingBasket, Receipt, BarChart4, LayoutDashboard, 
  UtensilsCrossed, Calendar, Settings, Clock, Flame, Pizza, CookingPot
} from 'lucide-react';
import { useDatabase } from '@/contexts/database-context';
import { useConnections } from '@/hooks/use-database';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { currentConnection, isConnected } = useDatabase();
  const { data: connections } = useConnections();

  return (
    <aside className="w-full md:w-64 bg-card border-r shadow-sm flex-shrink-0">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-sm font-medium">
            {isConnected ? 'Connected to Database' : 'Not Connected'}
          </span>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Restaurant Management
          </h3>
          <nav>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => onSectionChange('query-editor')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${
                    activeSection === 'query-editor' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground hover:bg-muted/50'
                  } transition`}
                >
                  <Code className="h-4 w-4" />
                  <span>SQL Editor</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSectionChange('tables-explorer')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${
                    activeSection === 'tables-explorer' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground hover:bg-muted/50'
                  } transition`}
                >
                  <Database className="h-4 w-4" />
                  <span>Database Schema</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Restaurant Data
          </h3>
          <nav>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => onSectionChange('employees')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${
                    activeSection === 'employees' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground hover:bg-muted/50'
                  } transition`}
                >
                  <Users className="h-4 w-4" />
                  <span>Employees</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSectionChange('inventory')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${
                    activeSection === 'inventory' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground hover:bg-muted/50'
                  } transition`}
                >
                  <ShoppingBasket className="h-4 w-4" />
                  <span>Inventory</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSectionChange('menu')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${
                    activeSection === 'menu' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground hover:bg-muted/50'
                  } transition`}
                >
                  <Pizza className="h-4 w-4" />
                  <span>Menu & Dishes</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSectionChange('orders')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${
                    activeSection === 'orders' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground hover:bg-muted/50'
                  } transition`}
                >
                  <Receipt className="h-4 w-4" />
                  <span>Orders</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSectionChange('kitchen')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${
                    activeSection === 'kitchen' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground hover:bg-muted/50'
                  } transition`}
                >
                  <CookingPot className="h-4 w-4" />
                  <span>Kitchen</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Analytics
          </h3>
          <nav>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => onSectionChange('reports')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${
                    activeSection === 'reports' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground hover:bg-muted/50'
                  } transition`}
                >
                  <BarChart4 className="h-4 w-4" />
                  <span>Reports</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSectionChange('history')}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left ${
                    activeSection === 'history' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground hover:bg-muted/50'
                  } transition`}
                >
                  <Clock className="h-4 w-4" />
                  <span>Query History</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
        
        {connections && connections.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Recent Connections
            </h3>
            <ul className="space-y-1">
              {connections.slice(0, 3).map(conn => (
                <li key={conn.id}>
                  <button
                    onClick={() => {
                      onSectionChange('query-editor');
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50 transition text-sm w-full text-left"
                  >
                    <Database className="h-3.5 w-3.5" />
                    <span>{conn.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
