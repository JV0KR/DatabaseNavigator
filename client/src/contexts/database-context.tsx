import React, { createContext, useContext, useState, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Connection, QueryResult, TableInfo } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type DatabaseContextType = {
  currentConnection: Connection | null;
  isConnected: boolean;
  queryResults: QueryResult | null;
  isExecutingQuery: boolean;
  setCurrentConnection: (connection: Connection | null) => void;
  testConnection: (connectionData: any) => Promise<boolean>;
  saveConnection: (connectionData: any) => Promise<Connection | null>;
  executeQuery: (sql: string) => Promise<QueryResult | null>;
  resetQueryResults: () => void;
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [currentConnection, setCurrentConnection] = useState<Connection | null>(null);
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);
  const { toast } = useToast();

  const testConnection = useCallback(async (connectionData: any): Promise<boolean> => {
    try {
      await apiRequest("POST", "/api/connections/test", connectionData);
      toast({
        title: "Connection Test Successful",
        description: "Successfully connected to the database.",
        variant: "success"
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Connection Test Failed",
        description: error.message || "Failed to connect to the database.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const saveConnection = useCallback(async (connectionData: any): Promise<Connection | null> => {
    try {
      const response = await apiRequest("POST", "/api/connections", connectionData);
      const connection = await response.json();
      setCurrentConnection(connection);
      toast({
        title: "Connection Saved",
        description: "Database connection has been saved.",
        variant: "success"
      });
      return connection;
    } catch (error: any) {
      toast({
        title: "Failed to Save Connection",
        description: error.message || "Failed to save database connection.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const executeQuery = useCallback(async (sql: string): Promise<QueryResult | null> => {
    if (!currentConnection) {
      toast({
        title: "No Active Connection",
        description: "Please connect to a database first.",
        variant: "destructive"
      });
      return null;
    }

    setIsExecutingQuery(true);
    try {
      const response = await apiRequest("POST", "/api/query", {
        connectionId: currentConnection.id,
        query: sql
      });
      
      const results = await response.json();
      setQueryResults(results);
      toast({
        title: "Query Executed Successfully",
        description: `Query completed in ${results.executionTime}ms with ${results.rowCount} rows.`,
        variant: "success"
      });
      return results;
    } catch (error: any) {
      toast({
        title: "Query Execution Failed",
        description: error.message || "Failed to execute query.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsExecutingQuery(false);
    }
  }, [currentConnection, toast]);

  const resetQueryResults = useCallback(() => {
    setQueryResults(null);
  }, []);

  const value = {
    currentConnection,
    isConnected: !!currentConnection,
    queryResults,
    isExecutingQuery,
    setCurrentConnection,
    testConnection,
    saveConnection,
    executeQuery,
    resetQueryResults
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}
