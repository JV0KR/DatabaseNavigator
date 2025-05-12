import React from 'react';
import { Connection } from '@shared/schema';
import { Database, UtensilsCrossed, Settings, Moon, Sun } from 'lucide-react';
import { useConnections } from '@/hooks/use-database';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDatabase } from '@/contexts/database-context';
import { useTheme } from "next-themes";

interface HeaderProps {
  onOpenSettings: () => void;
  currentConnection: Connection | null;
}

export default function Header({ onOpenSettings, currentConnection }: HeaderProps) {
  const { data: connections } = useConnections();
  const { setCurrentConnection } = useDatabase();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleConnectionChange = (connectionId: string) => {
    if (!connections) return;
    const connection = connections.find(conn => conn.id.toString() === connectionId);
    if (connection) {
      setCurrentConnection(connection);
    }
  };

  return (
    <header className="bg-card border-b shadow-sm py-3 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Restaurant Database Manager</h1>
            <p className="text-sm text-muted-foreground">Manage your restaurant data efficiently</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Theme toggle button */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <div className="relative">
            <Select 
              value={currentConnection ? currentConnection.id.toString() : ""}
              onValueChange={handleConnectionChange}
              disabled={!connections || connections.length === 0}
            >
              <SelectTrigger className="w-[220px] pl-10">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Database className="h-4 w-4 text-muted-foreground" />
                </span>
                <SelectValue placeholder="Select Connection" />
              </SelectTrigger>
              <SelectContent>
                {connections?.map(conn => (
                  <SelectItem key={conn.id} value={conn.id.toString()}>
                    {conn.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="default"
            size="sm"
            onClick={onOpenSettings}
          >
            <Settings className="h-4 w-4 mr-2" />
            <span>Connect to Database</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
